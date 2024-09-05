from enum import Enum
from json import dumps
from zipfile import ZipFile, ZIP_DEFLATED
from io import BytesIO
from datetime import datetime
from gridfs import GridOut
from shared.settings import (
    TEMP_BUCKET,
    SECRET_KEY,
    SECRET_ALGO,
    APP_BACKEND_URL,
    TEMP_ZIP,
)
from shared.storage_db import DataBase
from shared.app_services import Bucket
from shared.utils import emit_token
from shared.embedding_db import EmbeddingStorage
from bson import ObjectId
from typing import Any, Optional
import requests
from os import mkdir, path, remove
from .hasher import VHash, IHash


class EmbeddingStatus(Enum):
    DUPLICATE = "u"
    VALIDATION = "v"
    REBOUND = "r"


class Zipper:
    written: bool = False
    archive_extension: str = "zip"

    def __init__(self, bucket_name: str, file_ids: list[str]) -> None:
        self.object_set = Bucket(bucket_name).get_download_objects(file_ids)

        self._get_annotation(bucket_name, file_ids)

        self.archive: str = ""
        self.bucket_name = bucket_name

    async def archive_objects(self) -> Optional[bool]:
        if not self.annotated or self.written: return

        if not path.exists(TEMP_ZIP): mkdir(TEMP_ZIP)

        self.archive = f"{TEMP_ZIP}/{ObjectId()}.{self.archive_extension}"
        json_data: Any = dumps(self.annotation, indent=4).encode("utf-8")

        with ZipFile(self.archive, "w", ZIP_DEFLATED) as zip:
            try:
                while object := await self.object_set.next(): zip.writestr(
                    self._get_object_name(object),
                    object.read()
                )
            except StopAsyncIteration: ...

            with BytesIO(json_data) as annotation: zip.writestr(
                "annotation.json",
                annotation.read()
            )

        self.written = True
        return self.written

    async def write_archive(self) -> Optional[str]:
        if self.archive_id: return self.archive_id

        if not self.archive: raise FileExistsError

        with open(self.archive, "rb") as archive: self._archive_id = await DataBase \
            .get_fs_bucket(TEMP_BUCKET) \
            .upload_from_stream(
                filename=f"{self.bucket_name}_dataset",
                source=archive,
                metadata={"created_at": datetime.now().isoformat()},
            )

    def delete_temp_zip(self): remove(self.archive)

    def _get_object_name(self, object: GridOut) -> str:
        prepared_name: str = object.name
        extension: str = object.metadata.get("file_extension", "")

        if extension: prepared_name += f".{extension}"

        return prepared_name

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
        "status"
    )

    def __init__(self, bucket_name: str, uid: str):
        self.bucket_name = bucket_name
        self.file_id = uid

    async def get_file(self):
        file = await Bucket(self.bucket_name).get_object(self.file_id)
        assert file, "No file found"

    def hash(self):
        match self.file.metadata.get("file_type"):
            case "image": self.embedding = IHash(self.file.file).embedding
            case "video": self.embedding = VHash(self.file.file).embedding
            case _: raise ValueError("Unsupported file type")

    def search_similar(self):
        with EmbeddingStorage() as storage:
            try:
                result = storage.search(self.embedding)
                assert not result

                storage.insert(self.file_id, self.embedding, self.file.file.length)
                self.status = EmbeddingStatus.VALIDATION

            except AssertionError: self.status = EmbeddingStatus.DUPLICATE

    def process_result(self):
        assert (
            (status := getattr(self, "status"))
            and
            (result := getattr(self, "result"))
        )

        if status == EmbeddingStatus.VALIDATION: return

        uid, size = result

        if self.file.file.length > size:
            ...
            # means that new file is the same but has more quality
            # delete old embedding (maybe just flag it)
            # insert new embedding
            # rebound old file to new one
            # send to new one status duplicated

    @staticmethod
    def update_status(
        file_id: str,
        status: EmbeddingStatus,
        new_file: Optional[str]=None
    ):
        payload_token = emit_token({"minutes": 1}, SECRET_KEY, SECRET_ALGO)
        payload = {"status": status.value}

        if new_file: payload["rebound"] = new_file

        response = requests.patch(
            APP_BACKEND_URL + f"/api/files/{file_id}/",
            headers={
                "Authorization": "Internal " + payload_token,
                "Content-Type": "application/json",
            },
            json=payload
        )

        assert response.status_code == 202, "File update was not accepted"
