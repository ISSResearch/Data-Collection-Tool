from json import dumps, loads # noqa
from zipfile import ZipFile, ZIP_DEFLATED
from io import BytesIO
from datetime import datetime
from shared.settings import TEMP_BUCKET
from shared.db_manager import DataBase
from shared.app_services import Bucket


class Zipper:
    written: bool = False
    archive_extension: str = "zip"

    def __init__(self, bucket_name: str, file_ids: list[int]) -> None:
        project_bucket = Bucket(bucket_name)
        objects = project_bucket.get_download_objects(file_ids)

        self.object_set = objects

    def archive_objects(self, add_data=[]):
        # json_data = dumps(serialized_data, indent=4).encode('utf-8')`
        archive = BytesIO()

        with ZipFile(archive, 'w', ZIP_DEFLATED) as zip:
            if not self.written:
                for object in self.object_set:
                    zip.writestr(object.name, object.read())

                self.written = True

            for name, data in add_data: zip.writestr(name, data)

        archive.seek(0)

        self.archive = archive

    def write_archive(self):
        if self.archive_id: return self.archive_id

        if self.archive.closed: raise BufferError

        if self.archive.tell() != 0: self.archive.seek(0)

        bucket = DataBase.get_fs_bucket(TEMP_BUCKET)

        create_time = datetime.now()

        self._archive_id = bucket.upload_from_stream(
            filename=self._get_name(),
            source=self.archive.read(),
            metadata={
                "created_at": create_time.isoformat()
            }
        )

        self.archive.close()

        return self.archive_id

    def _get_name(self) -> str: return 'name' + self.archive_extension

    @property
    def archive_id(self):
        if not self.__dict__.get("_archive_id"): return None
        return str(self._archive_id)
