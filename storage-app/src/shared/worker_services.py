from json import dumps, loads # noqa
from zipfile import ZipFile, ZIP_DEFLATED
from io import BytesIO
from datetime import datetime
from gridfs import GridOutCursor, GridFSBucket
from shared.settings import TEMP_BUCKET, SECRET_KEY, SECRET_ALGO
from shared.db_manager import DataBase
from shared.app_services import Bucket
from shared.utils import emit_token
from bson import ObjectId
from typing import Any
from requests import post


class Zipper:
    written: bool = False
    archive_extension: str = "zip"

    def __init__(self, bucket_name: str, file_ids: list[int]) -> None:
        project_bucket: Bucket = Bucket(bucket_name)
        self.object_set: GridOutCursor = project_bucket.get_download_objects(file_ids)
        self._get_annotation(bucket_name, file_ids)

    def archive_objects(self, add_data: tuple = ()) -> None:
        archive: BytesIO = BytesIO()

        if not self.annotated:
            self.archive: BytesIO = archive
            self.archive.close()
            return

        json_data: Any = dumps(self.annotation, indent=4).encode('utf-8')

        # TODO: check other compress types
        with ZipFile(archive, 'w', ZIP_DEFLATED) as zip:
            if not self.written:
                for object in self.object_set:
                    zip.writestr(object.name, object.read())

                self.written = True

                with BytesIO(json_data) as annotation:
                    zip.writestr("annotation.json", annotation.read())

            for name, data in add_data: zip.writestr(name, data)

        archive.seek(0)

        self.archive: BytesIO = archive

    def write_archive(self) -> str | None:
        if self.archive_id: return self.archive_id

        if self.archive.closed: raise BufferError

        if self.archive.tell(): self.archive.seek(0)

        bucket: GridFSBucket = DataBase.get_fs_bucket(TEMP_BUCKET)

        create_time: datetime = datetime.now()

        self._archive_id: ObjectId = bucket.upload_from_stream(
            filename=self._get_name(),
            source=self.archive.read(),
            metadata={
                "created_at": create_time.isoformat()
            }
        )

        self.archive.close()

        return self.archive_id

    def _get_name(self) -> str: return 'name' + self.archive_extension

    def _get_annotation(self, bucket_name: str, file_ids: list[int]) -> Any:
        url: str = "http://localhost:8000/api/files/annotation/"
        payload_token: str = emit_token(
            {"minutes": 1},
            SECRET_KEY,
            SECRET_ALGO,
            {"user_id": 1, "is_superuser": True}
        )

        try: prefix, project_id = bucket_name.split('_')
        except Exception: project_id = ""

        headers = {
            "Authorization": "Bearer " + payload_token,
            "Content-Type": "application/json"
        }
        payload: str = dumps({
            "project_id": project_id,
            "file_ids": file_ids
        })

        request = post(url, headers=headers, json=payload)

        response = loads(request.json())

        self.annotation: dict[str, Any] = response.annotation
        self.annotated: int = response.annotated

    @property
    def archive_id(self) -> str | None:
        if not self.__dict__.get("_archive_id"): return None
        return str(self._archive_id)
