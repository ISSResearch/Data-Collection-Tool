from json import dumps, loads # noqa
from zipfile import ZipFile, ZIP_DEFLATED
from io import BytesIO
from datetime import datetime
from gridfs import GridOutCursor
from shared.settings import TEMP_BUCKET, SECRET_KEY, SECRET_ALGO, APP_BACKEND_URL
from shared.db_manager import DataBase
from shared.app_services import Bucket
from shared.utils import emit_token
from bson import ObjectId
from typing import Any
from requests import post, Response
from time import time
from os import mkdir, path, remove


class Zipper:
    written: bool = False
    archive_extension: str = "zip"
    temp_prefix = "./temp_zip"

    def __init__(self, bucket_name: str, file_ids: list[int]) -> None:
        self.object_set: GridOutCursor = Bucket(bucket_name) \
            .get_download_objects(file_ids)

        self._get_annotation(bucket_name, file_ids)

        if not path.exists(self.temp_prefix): mkdir(self.temp_prefix)

        self.archive: str = ""
        self.bucket_name = bucket_name

    def archive_objects(self) -> None:
        if not self.annotated or self.written: return

        self.archive = f"{self.temp_prefix}/{int(time())}.{self.archive_extension}"
        json_data: Any = dumps(self.annotation, indent=4).encode('utf-8')

        # TODO: check other compress types
        with ZipFile(self.archive, 'w', ZIP_DEFLATED) as zip:
            for object in self.object_set:
                zip.writestr(self._get_object_name(object), object.read())

            with BytesIO(json_data) as annotation:
                zip.writestr("annotation.json", annotation.read())

        self.written = True

    def write_archive(self) -> str | None:
        if self.archive_id: return self.archive_id

        if not self.archive: raise FileExistsError

        with open(self.archive, 'rb') as archive:
            self._archive_id: ObjectId = DataBase \
                .get_fs_bucket(TEMP_BUCKET) \
                .upload_from_stream(
                    filename=f"{self.bucket_name}_dataset.zip",
                    source=archive,
                    metadata={"created_at": datetime.now().isoformat()}
                )

    def delete_temp_zip(self) -> None: remove(self.archive)

    def _get_object_name(self, object) -> str:
        prepared_name: str = object.name
        extension: str = object.metadata.get("file_extension", "")

        if extension: prepared_name += f".{extension}"

        return prepared_name

    def _get_annotation(self, bucket_name: str, file_ids: list[int]) -> Any:
        url: str = APP_BACKEND_URL + "/api/files/annotation/"
        payload_token: str = emit_token(
            {"minutes": 1},
            SECRET_KEY,
            SECRET_ALGO,
        )

        try: prefix, project_id = bucket_name.split('_')
        except Exception: project_id = ""

        headers: dict[str, Any] = {
            "Authorization": "Internal " + payload_token,
            "Content-Type": "application/json"
        }
        payload: dict[str, Any] = {
            "project_id": project_id,
            "file_ids": file_ids
        }

        response: Response = post(url, headers=headers, json=payload)

        if response.status_code != 202: raise ConnectionError

        response_data: Any = response.json()

        self.annotation: dict[str, Any] = response_data["annotation"]
        self.annotated: int = response_data["annotated"]

    @property
    def archive_id(self) -> str | None:
        a_id: Any = self.__dict__.get("_archive_id")
        if a_id: return str(a_id)
