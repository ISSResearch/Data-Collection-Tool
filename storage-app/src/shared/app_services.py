from typing_extensions import Generator, Iterator
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
from shared.db_manager import DataBase, GridFSBucket


class Headers:
    headers_fields: tuple = ("chunk", "total_chunks")

    def __init__(self, data: dict[str, str]) -> None:
        self._headers: dict[str, str] = data
        self.is_valid: bool = False

    def validate(self) -> None:
        self.chunk: str | None = self._headers.get("chunk")
        self.total_chunks: str | None = self._headers.get("total_chunks")
        self.is_valid = bool(self.chunk and self.total_chunks)

    @property
    def is_new(self) -> bool: return not self.chunk or self.chunk == 1

    @property
    def is_last_chunk(self) -> bool:
        try: return bool(self.is_valid and self.chunk == self.total_chunks)

        except AttributeError: return False


class FileMeta:
    meta_fields = ("file_name", "file_extension", "file_type")

    def __init__(self, data: str) -> None:
        self._meta: Any = loads(data)
        self.is_valid: bool = False

    def get(self) -> dict:
        return {
            meta_name: self._meta.get(meta_name)
            for meta_name in self.meta_fields
        }


class ObjectStreaming:
    slots = (
        'RANGE_RE',
        'file',
        'meta',
        'file_size',
        'content_type',
        'range_match',
        'chunk_start',
        'chunk_end',
        'chunk_length'
    )
    RANGE_RE: Pattern = compile(r"bytes\s*=\s*(\d+)\s*-\s*(\d*)", I)

    def __init__(self, file: GridOut) -> None:
        self.file: GridOut = file
        self.meta: dict[str, Any] = file.metadata
        self.file_size: int = file.length
        self.content_type: str = self._get_file_type()
        self._set_chunks()

    def stream(self, request: Request) -> StreamingResponse:
        self.range_match: Match[str] | None = self._get_range_match(request)
        if self.range_match: self._set_chunks()

        response: StreamingResponse = StreamingResponse(
            iter(self),
            status_code=(206 if self.range_match else 200),
            media_type=self.content_type
        )

        chunk_range: str = f"{self.chunk_start}-{self.chunk_end}/{self.file.length}"
        response.headers["Content-Range"] = "bytes " + chunk_range
        response.headers["Content-Length"] = str(self.file.length)

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

    def _get_file_type(self) -> str:
        if '.' not in self.meta.get("file_name", ""):
            return self.meta.get("file_type", "image") + "/png"

        extension: str = self.meta.get("file_name", ".png").split('.')[-1]
        return f'{self.meta.get("file_type", "image")}/{extension}'

    def _get_range_match(self, request: Request) -> Match[str] | None:
        range_header: str = request.headers.get('range', '')

        return self.RANGE_RE.match(range_header)

    def _set_chunks(self) -> None:
        chunk_start, chunk_end = self.__dict__.get('range_match', (0, 0))

        chunk_start = int(chunk_start)
        chunk_end = int(chunk_end) if chunk_end else chunk_start + CHUNK_SIZE

        if chunk_end >= self.file_size: chunk_end = self.file_size - 1

        chunk_length = chunk_end - chunk_start + 1

        self.chunk_start: int = chunk_start
        self.chunk_end: int = chunk_end
        self.chunk_length: int = chunk_length


class BucketObject:
    __slots__ = ("file_id", "meta", "headers", "_fs")

    def __init__(self, fs: GridFSBucket) -> None: self._fs = fs

    def put_object(
        self,
        request: Request,
        file_id: str,
        file: UploadFile,
        file_meta: str
    ) -> tuple:
        self._prepare_payload(file_meta, request.headers)
        self.file_id: ObjectId | str = get_object_id(file_id)

        try:
            if self.headers.is_new: self._create_file(file)
            else: self._append_file(file)

            return True, self.headers.is_last_chunk, (
                status.HTTP_201_CREATED
                if self.headers.is_new
                else status.HTTP_202_ACCEPTED
            )

        except Exception: return False, status.HTTP_400_BAD_REQUEST

    def delete_object(self, object_id: str) -> tuple:
        try:
            self._fs.delete(object_id)
            return True, ""

        except Exception: return False, "error message"

    def _prepare_payload(
        self,
        file_meta: str = "",
        request_headers: dict = {}
    ) -> None:
        self.meta: FileMeta = FileMeta(file_meta)
        self.headers: Headers = Headers(request_headers)

        self.headers.validate()

    def _create_file(self, chunk: UploadFile) -> ObjectId:
        meta: dict[str, Any] = self.meta.get()

        return self._fs.upload_from_stream_with_id(
            file_id=self.file_id,
            filename=meta.get("file_name", ""),
            source=chunk.file,
            metadata=meta
        )

    def _append_file(self, chunk: UploadFile) -> ObjectId | None:
        try:
            previous_file: GridOut = self._fs.open_download_stream(self.file_id)

            new_item: dict[str, Any] = {
                "file_id": previous_file._id,
                "filename": previous_file.name,
                # TODO: make generator
                "source": previous_file.read() + chunk.file.read(),
                "metadata": self.meta.get()
            }

            self._fs.delete(previous_file._id)

            return self._fs.upload_from_stream_with_id(**new_item)

        except NoFile: self._create_file(chunk)


class Bucket(BucketObject):
    __slots__ = ("_fs",)

    def __init__(self, bucket_name: str) -> None:
        self._fs: GridFSBucket = DataBase.get_fs_bucket(bucket_name)

    def put_object(
        self,
        request: Request,
        file_id: str,
        file: UploadFile,
        file_meta: str
    ) -> tuple:
        return super().put_object(request, file_id, file, file_meta)

    def delete_object(self, object_id: str) -> tuple:
        return super().delete_object(object_id)

    def get_object(self, object_id: str) -> ObjectStreaming | None:
        try:
            file: GridOut = self._fs.open_download_stream(get_object_id(object_id))
            return ObjectStreaming(file)

        except NoFile: return None

    def get_download_objects(self, file_ids: list[int]) -> GridOutCursor:
        return self._fs.find({"_id": {"$in": file_ids}})
