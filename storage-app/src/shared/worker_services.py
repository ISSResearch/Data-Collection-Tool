from enum import Enum
from json import dumps
from zipfile import ZipFile, ZIP_DEFLATED, ZIP_STORED
from datetime import datetime
from gridfs import GridOut
from shared.settings import (
    TEMP_BUCKET,
    SECRET_KEY,
    SECRET_ALGO,
    APP_BACKEND_URL,
    TEMP_ZIP,
    ASYNC_PRODUCER_MAX_CONCURRENT as MAX_CONCURENT
)
from asyncio import get_event_loop
from shared.storage_db import DataBase
from shared.app_services import Bucket
from shared.utils import emit_token
from shared.embedding_db import EmbeddingStorage
from bson import ObjectId
from typing import Any, Optional
import requests
from os import mkdir, path, remove
from .hasher import VHash, IHash
from queue import Queue
from .archive_helpers import FileProducer, ZipConsumer


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

    def __init__(self, bucket_name: str, file_ids: list[str]) -> None:
        self.object_set = Bucket(bucket_name).get_download_objects(file_ids)

        self._get_annotation(bucket_name, file_ids)

        self.archive: str = ""
        self.bucket_name = bucket_name

    async def archive_objects(self) -> Optional[bool]:
        if not path.exists(TEMP_ZIP): mkdir(TEMP_ZIP)

        self.archive = f"{TEMP_ZIP}/{ObjectId()}.{self.archive_extension}"
        json_data: Any = ("annotation.json", dumps(self.annotation, indent=4).encode("utf-8"))

        queue = Queue()

        producer = FileProducer(self.object_set, queue, MAX_CONCURENT)
        consumer = ZipConsumer(self.archive, queue, [json_data])

        consumer.start()

        await producer.produce()
        await self.object_set.close()

        consumer.join()

        self.written = True
        return self.written

    async def _archive_objects(self) -> Optional[bool]:
        if not path.exists(TEMP_ZIP): mkdir(TEMP_ZIP)

        self.archive = f"{TEMP_ZIP}/{ObjectId()}.{self.archive_extension}"
        json_data: Any = dumps(self.annotation, indent=4).encode("utf-8")

        with ZipFile(self.archive, "w", ZIP_STORED) as zip:
            try:
                while object := await self.object_set.next(): zip.writestr(
                    self._get_object_name(object),
                    object.read()
                )
            except StopAsyncIteration: pass
            finally: await self.object_set.close()

            zip.writestr("annotation.json", json_data)

        self.written = True
        return self.written

    async def write_archive(self) -> Optional[str]:
        if self.archive_id: return self.archive_id

        if not self.archive: raise FileExistsError

        with open(self.archive, "rb") as archive:
            self._archive_id = await DataBase \
                .get_fs_bucket(TEMP_BUCKET) \
                .upload_from_stream(
                    filename=f"{self.bucket_name}_dataset",
                    source=archive,
                    metadata={"created_at": datetime.now().isoformat()}
                )

    def delete_temp_zip(self): remove(self.archive)

    def _get_object_name(self, object: GridOut) -> str:
        name = str(object._id)
        extension = object.metadata.get("file_extension", "")

        if extension: name += f".{extension}"

        return name

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
        file = get_event_loop().run_until_complete(
            Bucket(self.bucket_name)
            .get_object(self.file_id)
        )
        assert file, "No file found"

        self.file = file.file

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
