from sys import argv, exit
from os.path import sep, join
from urllib.parse import unquote
from math import ceil
from typing import Any
from threading import Thread, Lock
from shared.db_manager import DataBase, GridFSBucket
from shared.utils import (
    APP_BACKEND_URL,
    SECRET_KEY,
    SECRET_ALGO,
    get_db_uri,
    emit_token
)
from requests import get, Response


LOCK = Lock()

class File:
    TYPE_MAP: dict[str, str] = {
        'jpg': "image",
        'mkv': "video",
        'mov': "video",
        'x-matroska': "video",
        'mp4': "video",
        'quicktime': "video",
        'jpeg': "image",
        "png": "image",
        "webp": "video"
    }
    REPLACE_SYMBOLS = (
        ("%20", ' '),
        ("%2C", ','),
        ("%2F", '/'),
        ("%3A", ':'),
        ("%3D", '='),
        ("%3F", '?'),
        ("%26", '&'),
        ("%23", '#'),
        ("%25", '%')
    )

    def __init__(
        self,
        bucket: GridFSBucket,
        id: int | None = None,
        path: str | None = None,
        file_name: str | None = None,
        attributes: Any = None,
        author_name: Any = None,
        file_type: Any = None,
        status: Any = None,
        upload_date: Any = None,
        is_downloaded: Any = None
    ) -> None:
        self.file_id: str = str(id)
        self.file_path: str | None  = self._prepare_str(path or "")
        self.name: str = self._prepare_str(file_name or '.')
        self._fs: GridFSBucket = bucket
        self.form_meta()

    def form_meta(self) -> None:
        *extr_name, extension = self.name.split(".")

        self.file_meta = {
            "file_name": "".join(extr_name),
            "file_extension": extension,
            "file_type": self.TYPE_MAP.get(extension, "video")
        }

    def write(self):
        if not self.file_path: return

        try:
            with open(self.file_path, 'rb') as origin_file:
                self._fs.upload_from_stream_with_id(
                    file_id=self.file_id,
                    filename=self.file_meta.get("file_name", ""),
                    source=origin_file,
                    metadata=self.file_meta
                )
                print(f"{self._fs._bucket_name}: writing file - {self.file_id} || {self._fs._bucket_name}: file - {self.file_id} wrote succdeed")

        except Exception as e:
            message: str = f"{self._fs._bucket_name}: writing file - {self.file_id} || {self._fs._bucket_name}: file - {self.file_id} wrote fail exception: {e}"
            print(message)
            with LOCK:
                with open("migration_errors.txt", "a") as error_file:
                    error_file.write(message + '\n')

    def _prepare_str(self, name: str) -> str:
        for sign, char in self.REPLACE_SYMBOLS:
            if sign in name:
                name = name.replace(sign, char)

        return unquote(name)


class Project:
    chunk_ln: int = 1000

    def __init__(self, p_id: int):
        self.project_id: int = p_id
        self.data: list[dict[str, Any]] | None = None

    def migrate(self) -> tuple[int, bool, str]:
        print(f"Project {self.project_id}: start migrating")

        if self.data is None:
            try: self.data = self._request_files()
            except ConnectionError: return (self.project_id, False, "connection error")

        if not self.data: return (self.project_id, False, "no data")

        self.bucket: GridFSBucket = DataBase.get_fs_bucket(
            "project_" + str(self.project_id)
        )

        for chunk in range(ceil(len(self.data) / self.chunk_ln)):
            print(f"Project {self.project_id}: spawning writing thread {chunk + 1}/{ceil(len(self.data) / self.chunk_ln)}")

            start, end = chunk * self.chunk_ln, (chunk+1) * self.chunk_ln
            chunk_data: list[dict[str, Any]] = self.data[start:end]

            pool: list[Thread] = [
                Thread(
                    target=self._write_chunk,
                    args=(chunk_data[i*250:(i+1)*250],)
                )
                for i in range(ceil(len(chunk_data) / 250))
            ]

            for th in pool: th.start()
            for th in pool: th.join()

        return (self.project_id, True, "success")

    def _write_chunk(self, *args):
        data, *_ = args
        files: list[File] = [File(self.bucket, **item) for item in data]
        for file in files: file.write()


    def _request_files(self) -> Any:
        print(f"Project {self.project_id}: getting data...")

        token: str = emit_token(
            {"minutes": 1},
            SECRET_KEY,
            SECRET_ALGO,
        )

        response: Response = get(
            APP_BACKEND_URL + "/api/files/project/" + str(self.project_id),
            headers={"Authorization": "Internal " + token}
        )

        if response.status_code != 200: raise ConnectionError

        return response.json()


def run_migration(project_ids: list[int]):
    print("starting migration process...")

    migration_projects: set[Project] = {Project(p_id) for p_id in project_ids}

    results: set[tuple[int, bool, str]] = {
        project.migrate() for project in migration_projects
    }

    with open("migration_results.txt", "w") as result_file:
        for result in results: result_file.write(f"{result}" + "\n")

def prepared_args(args: str) -> list[int]:
    prepared: list[str] = args.split(',')

    return [int(p_id) for p_id in prepared]

if __name__ == "__main__":
    try:
        name, args, *rest = argv
        project_ids: list[int] = prepared_args(args)
    except ValueError:
        print("NO valid projects passed. tip: '1,2,3'")
        exit(1)

    run_migration(project_ids)
