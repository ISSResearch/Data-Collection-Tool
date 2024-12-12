from enum import Enum
from json import dumps
from shared.settings import (
    SECRET_KEY,
    SECRET_ALGO,
    APP_BACKEND_URL,
    ASYNC_PRODUCER_MAX_CONCURRENT as MAX_CONCURENT
)
from shared.storage_db import SyncDataBase
from time import sleep as stall_for
from shared.utils import emit_token
from shared.embedding_db import EmbeddingStorage
from shared.utils import get_object_id
from typing import Any, Optional
import requests
from .hasher import VHash, IHash
from queue import Queue
from .archive_helpers import FileProducer, ZipConsumer, ZipWriter
from celery import Task


class EmbeddingStatus(Enum):
    DUPLICATE = "u"
    VALIDATION = "v"
    REBOUND = "r"

    def __json__(self, *args, **kwargs): return self.name

    def to_value(self):
        match self.value:
            case "u": return "v"
            case _: return self.value


class Zipper:
    written: bool = False
    archive_extension: str = "zip"

    def __init__(
        self,
        bucket_name: str,
        file_ids: list[str],
        task: Task
    ) -> None:
        self.file_ids = file_ids
        self.bucket_name = bucket_name
        self._task = task

        self._get_annotation(bucket_name, file_ids)

    def archive_objects(self) -> Optional[bool]:
        json_data: Any = ("annotation.json", dumps(self.annotation, indent=4).encode("utf-8"))
        # object_set = Bucket(self.bucket_name).get_download_objects(self.file_ids)
        object_set = SyncDataBase \
            .get_fs_bucket(self.bucket_name) \
            .find(
                {"_id": {"$in": [get_object_id(str(object_id)) for object_id in self.file_ids]}},
                no_cursor_timeout=True
            ) \
            .batch_size(200)

        queue = Queue()

        producer = FileProducer(object_set, queue, MAX_CONCURENT)
        writer = ZipWriter(f"{self.bucket_name}_dataset")
        consumer = ZipConsumer(queue, [json_data], writer)

        consumer.start()
        writer.start()

        producer.produce_sync()

        wait_item = lambda t, n: type("wi", (object,), {"task": t, "next": n})
        wait_list = wait_item(producer, wait_item(consumer, wait_item(writer, None)))

        while wait_list:
            if wait_list.task.ready:
                wait_list = wait_list.next
                continue

            print(f"ZIP WORK STALL")
            self._task.update_state(state="PROGRESS")
            stall_for(5)

        object_set.close()
        consumer.join()
        writer.join()

        self.written = True

        assert (result_id := writer.result()), "Archive was not written"
        self._archive_id = result_id

        return self.written

    def _get_annotation(self, bucket_name: str, file_ids: list[str]) -> Any:
        url: str = APP_BACKEND_URL + "/api/files/annotation/"
        payload_token = emit_token({"minutes": 1}, SECRET_KEY, SECRET_ALGO)

        try: _, project_id = bucket_name.split("_")
        except Exception: project_id = ""

        headers: dict[str, Any] = {
            "Authorization": "Internal " + payload_token,
            "Content-Type": "application/json",
        }
        payload: dict[str, Any] = {"project_id": project_id, "file_ids": file_ids}

        response: requests.Response = requests.post(url, headers=headers, json=payload)

        if response.status_code != 202: raise ConnectionError

        response_data: Any = response.json()

        self.annotation: dict[str, Any] = response_data["annotation"]
        self.annotated: int = response_data["annotated"]

    @property
    def archive_id(self) -> Optional[str]:
        if a_id := self.__dict__.get("_archive_id"): return str(a_id)


class Hasher:
    __slots__: tuple[str, ...] = (
        "bucket_name",
        "file_id",
        "file",
        "embedding",
        "result",
        "status",
        "process_result",
        "project_id"
    )

    status: EmbeddingStatus
    result: list[tuple[str, int, float]]
    process_result: tuple[str, EmbeddingStatus, Optional[str]]

    def __init__(self, bucket_name: str, uid: str):
        self.bucket_name = bucket_name
        self.file_id = uid

        try: self.project_id = int(bucket_name.split("_")[1])
        except Exception: self.project_id = 0

    def get_file(self):
        self.file = SyncDataBase \
            .get_fs_bucket(self.bucket_name) \
            .open_download_stream(get_object_id(self.file_id))

    def hash(self):
        match self.file.metadata.get("file_type"):
            case "image": self.embedding = IHash(self.file).embedding
            case "video": self.embedding = VHash(self.file).embedding
            case _: raise ValueError("Unsupported file type")

    def search_similar(self):
        with EmbeddingStorage() as storage:
            self.result = storage.search(self.embedding, self.project_id)
            self.status = (
                EmbeddingStatus.DUPLICATE
                if len(self.result)
                else EmbeddingStatus.VALIDATION
            )

    def handle_search_result(self):
        assert getattr(self, "status"), "Search must be completed first"

        update_list: list[tuple[str, Optional[EmbeddingStatus], Optional[str]]] = []

        self._save_embedding()

        with EmbeddingStorage() as storage:
            if self.status == EmbeddingStatus.DUPLICATE:
                rmi: Optional[str] = None
                rmd: float = float("inf")

                for uid, size, distance in self.result:
                    if self.file.length > size:
                        storage.shadow(uid)
                        update_list.append((uid, None, self.file_id))

                    elif distance < rmd: rmi, rmd = uid, distance

                if rmi:
                    self.process_result = (self.file_id, self.status, rmi)
                    storage.shadow(self.file_id)

        if not hasattr(self, "process_result"):
            self.process_result = (self.file_id, self.status, None)

        update_list.append(self.process_result)

        [self.send_update(*payload) for payload in update_list]

    # todo: i'd like to recurse only embedding insertion
    def _save_embedding(self):
        try:
            emb_id = EmbeddingStorage().insert_embedding(self.embedding)
            EmbeddingStorage().insert_meta(
                emb_id,
                self.file_id,
                self.file.length,
                self.project_id
            )
        except Exception: self._save_embedding()

    @staticmethod
    def send_update(
        file_id: str,
        status: Optional[EmbeddingStatus] = None,
        rebound: Optional[str] = None
    ):
        payload_token = emit_token({"minutes": 1}, SECRET_KEY, SECRET_ALGO)
        payload = {}

        if status: payload["status"] = status.to_value()
        if rebound: payload["rebound"] = rebound

        if not status and not rebound: return

        print(f"\nid: {file_id}, status: {status}, rebound: {rebound}\n")

        response = requests.patch(
            APP_BACKEND_URL + f"/api/files/{file_id}/",
            headers={
                "Authorization": "Internal " + payload_token,
                "Content-Type": "application/json",
            },
            json=payload
        )

        assert response.status_code == 202, "File update was not accepted: " + response.text
