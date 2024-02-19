from typing_extensions import Coroutine, Generator, Iterator
from typing import Any, Pattern
from gridfs import NoFile, ObjectId, GridOut, GridOutCursor
from fastapi import Request, status
from fastapi.responses import StreamingResponse
from re import compile, I, Match
from json import loads
from os import SEEK_SET
from shared.settings import CHUNK_SIZE
from shared.utils import get_object_id
from shared.models import UploadFile
from shared.db_manager import DataBase, AsyncIOMotorGridFSBucket
from motor.motor_asyncio import AsyncIOMotorGridOutCursor
from hashlib import md5


class FileMeta:
    __slots__ = ("_meta", "_prepared_meta")
    META_FIELDS = ("file_name", "file_extension", "file_type")

    def __init__(self, data: str) -> None:
        self._meta: str = data
        self._prepared_meta: Any | None = None

    def get(self) -> dict:
        return {
            meta_name: self.prepared_meta.get(meta_name)
            for meta_name in self.META_FIELDS
        }

    @property
    def prepared_meta(self) -> Any:
        if not self._prepared_meta:
            self._prepared_meta = loads(self._meta)

        return self._prepared_meta


class ObjectStreaming:
    __slots__ = (
        "file",
        "range_match",
        "chunk_start",
        "chunk_end",
        "chunk_length",
    )
    RANGE_RE: Pattern = compile(r"bytes\s*=\s*(\d+)\s*-\s*(\d*)", I)

    def __init__(self, file: GridOut) -> None:
        self.file: GridOut = file
        self.range_match: Match[str] | None = None
        self._set_chunks()

    def stream(self, request: Request) -> StreamingResponse:
        return (
            self._stream_dataset()
            if request.query_params.get("archive") == "1"
            else self._stream_file(request)
        )

    def _stream_file(self, request: Request):
        self.range_match: Match[str] | None = self._get_range_match(request)
        if self.range_match: self._set_chunks()

        response: StreamingResponse = StreamingResponse(
            iter(self),
            status_code=(206 if self.range_match else 200),
            media_type=self.content_type
        )

        chunk_range: str = f"{self.chunk_start}-{self.chunk_end}/{self.file.length}"
        response.headers["Accept-Ranges"] = "bytes"
        response.headers["Content-Range"] = "bytes " + chunk_range

        return response

    def _stream_dataset(self):
        response: StreamingResponse = StreamingResponse(self.file)
        file_name: str = self.file.filename + ".zip"

        response.headers["Content-Disposition"] = f"attachment; filename={file_name}"

        return response

    def __iter__(self) -> Iterator: return self._file_iterator()

    def _file_iterator(self) -> Generator:
        self.file.seek(self.chunk_start, SEEK_SET)
        remaining_chunk: int = self.chunk_length

        while True:
            bytes_length: int = (
                self.file.length if not self.range_match
                else (
                    CHUNK_SIZE
                    if remaining_chunk is None
                    else min(remaining_chunk, CHUNK_SIZE)
                )
            )

            data: bytes = self.file.read(bytes_length)

            if not data: break
            if remaining_chunk: remaining_chunk -= len(data)

            yield data

    @property
    def content_type(self) -> str:
        type: str = self.file.metadata.get("file_type")
        extension: str = self.file.metadata.get("file_extension")

        return (
            f'{type}/{extension}'
            if type and extension
            else "application/octet-stream"
        )

    def _get_range_match(self, request: Request) -> Match[str] | None:
        return self.RANGE_RE.match(request.headers.get('range', ''))

    def _set_chunks(self) -> None:
        chunk_start, chunk_end = (
            self.range_match.groups() if self.range_match
            else (0, 0)
        )

        chunk_start = int(chunk_start)
        chunk_end = int(chunk_end) if chunk_end else chunk_start + CHUNK_SIZE

        if chunk_end >= self.file.length: chunk_end = self.file.length - 1

        chunk_length: int = chunk_end - chunk_start + 1

        self.chunk_start: int = chunk_start
        self.chunk_end: int = chunk_end
        self.chunk_length: int = chunk_length


class BucketObject:
    __slots__ = ("file_id", "meta", "headers", "_fs")

    def __init__(self, fs: AsyncIOMotorGridFSBucket) -> None: self._fs = fs

    async def put_object(
        self,
        file: UploadFile,
        file_meta: str
    ) -> tuple[str, int]:
        self.meta: FileMeta = FileMeta(file_meta)

        try:
            file_id: str = await self._create_file(file)
            return file_id, status.HTTP_201_CREATED

        except AssertionError:
            return "Such file already exists", status.HTTP_400_BAD_REQUEST

        except Exception as error:
            message: str = error.args[0]
            return message, status.HTTP_400_BAD_REQUEST

    async def delete_object(self, object_id: str) -> tuple[bool, str]:
        try: await self._fs.delete(get_object_id(object_id))
        except Exception: return False, "error message"
        return True, ""

    async def _create_file(self, file: UploadFile) -> str:
        content: bytes = await file.read()
        meta: dict[str, Any] = self.meta.get()
        new_item: dict[str, Any] = {
            "filename": meta.get("file_name", ""),
            "source": content,
            "metadata": meta
        }

        await self._set_hash(new_item)

        file_id: ObjectId = await self._fs.upload_from_stream(**new_item)

        return str(file_id)

    async def _set_hash(self, file_item: dict[str, Any]) -> None:
        new_hash: bytes = md5(file_item["source"]).digest()

        cursor: AsyncIOMotorGridOutCursor = self._fs.find(
            {"metadata.hash": new_hash}
        )

        if await cursor.fetch_next: raise AssertionError

        file_item["metadata"]["hash"] = new_hash


class Bucket(BucketObject):
    __slots__ = ("_fs",)

    def __init__(self, bucket_name: str) -> None:
        self._fs: AsyncIOMotorGridFSBucket = DataBase.get_fs_bucket(bucket_name)

    def get_object(self, object_id: str) -> ObjectStreaming | None:
        return None
        try:
            with self._fs.open_download_stream(get_object_id(object_id)) as file:
                return ObjectStreaming(file)

        except NoFile: return None

    def get_download_objects(self, file_ids: list[int]) -> GridOutCursor:
        prepared_ids: list[str | ObjectId] = [
            get_object_id(str(object_id))
            for object_id in file_ids
        ]

        return self._fs.find({"_id": {"$in": prepared_ids}})
