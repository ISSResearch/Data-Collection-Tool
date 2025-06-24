from enum import Enum
from json import dumps
from shared.settings import SECRET_KEY, SECRET_ALGO, APP_BACKEND_URL
from shared.storage_db import SyncDataBase, DataBase
from shared.utils import emit_token
from shared.embedding_db import EmbeddingStorage
from shared.utils import get_object_id
from typing import Any, Optional, cast, Iterable
import requests
from asyncio import run as block_on # noqa
from .hasher import VHash, IHash
from .sync_zipper import SyncZipping
from .concurrent_zipper import Producer, Consumer, MQueue
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
    archive_extension: str = "zip"

    def __init__(
        self,
        bucket_id: int,
        annotation: list[dict[str, Any]],
        task: Task
    ) -> None:
        self._task = task
        self.annotation = annotation
        self.bucket_id = bucket_id
        self.sources = None

    def parse_annotation(self):
        sources = {}

        for item in self.annotation:
            bucket = "project_" + str(item.get("rebound_project") or self.bucket_id)
            f_id: str = item.get("rebound") or item.get("id", "")
            f_list = sources.get(bucket, [])
            f_list.append(get_object_id(f_id))
            if bucket not in sources: sources[bucket] = f_list

        self.sources = list(sources.items())

    def _sync_zipper(self, additional: list[tuple[str, bytes]]) -> Optional[dict[str, Any]]:
        get_source = lambda b_name, f_list: SyncDataBase \
            .get_fs_bucket(b_name) \
            .find({"_id": {"$in": f_list}}, no_cursor_timeout=True) \
            .batch_size(200)

        source_sets = [
            get_source(b_name, f_list)
            for b_name, f_list
            in cast(Iterable, self.sources)
        ]

        zipper = SyncZipping(f"project_{self.bucket_id}_dataset", source_sets, additional)
        zipper.run()

        return zipper.result

    async def _async_zipper(self, additional: list[tuple[str, Any]]) -> Optional[dict[str, Any]]:
        get_source = lambda b_name, f_list: DataBase \
            .get_fs_bucket(b_name) \
            .find({"_id": {"$in": f_list}}, no_cursor_timeout=True) \
            .batch_size(200)

        source_sets = [
            get_source(b_name, f_list)
            for b_name, f_list
            in cast(Iterable, self.sources)
        ]

        consumer = Consumer(pq := MQueue(), fq := MQueue())
        producer = Producer(pq, fq, source_sets, additional, f"project_{self.bucket_id}_dataset")

        consumer.start(); await producer.start()
        consumer.join()

        return producer.result

    def archive_objects(self):
        assert self.sources, "Annotation must be parsed"
        json_data: Any = ("annotation.json", dumps(self.annotation, indent=4).encode("utf-8"))

        # self._result = block_on(self._async_zipper([json_data]))
        self._result = self._sync_zipper([json_data])

        assert self._result, "Error during Archiving"

    def send_result(self):
        assert self._result, "No task result, or missflow"

        payload_token = emit_token({"minutes": 1}, SECRET_KEY, SECRET_ALGO)

        res = requests.patch(
            f"{APP_BACKEND_URL}/api/projects/archive/{self.bucket_id}/{self._task.request.id}/",
            headers={
                "Authorization": "Internal " + payload_token,
                "Content-Type": "application/json",
            },
            json=self._result
        )

        res_status, res_data = res.status_code, res.text

        assert res_status == 202, f"Result send response {res_status}: {res_data}"


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
        match cast(dict, self.file.metadata).get("file_type"):
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
