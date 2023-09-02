from gridfs import NoFile, ObjectId
from fastapi import Request, UploadFile
from fastapi import status
from models import File
from re import compile, I


class Headers:
    headers_fields = ("chunk", "total_chunks")

    def __init__(self, data: dict) -> None:
        self._headers = data
        self.is_valid = False

    def validate(self) -> None:
        self.chunk = self._headers.get("chunk")
        self.total_chunks = self._headers.get("total_chunks")
        self.is_valid = self.chunk and self.total_chunks

    @property
    def is_new(self) -> bool: return not self.chunk or self.chunk == 1

    @property
    def is_last_chunk(self) -> bool:
        try:
            return bool(self.is_valid and self.chunk == self.total_chunks)

        except AttributeError: return False


class FileMeta:
    meta_fields = ("file_name", "file_extension", "file_type")

    def __init__(self, data: dict) -> None:
        self._meta = data
        self.is_valid = False

    def get(self) -> dict:
        return {
            meta_name: self._meta.get(meta_name)
            for meta_name in self.meta_fields
        }


class FileManager:
    __slots__ = ("_fs", "file_id", "meta", "headers")

    def put_object(self, request: Request, file_id: int, file: File) -> tuple:
        self._prepare_payload(file.file_meta, request.headers)
        self.file_id = file_id

        try:
            if self.headers.is_new: self._create_file(file.chunk)
            else: self._append_file(file.chunk)

            return True, (
                status.HTTP_201_CREATED
                if self.headers.is_new
                else status.HTTP_202_ACCEPTED
            )

        except Exception: return False, status.HTTP_400_BAD_REQUEST

    def _prepare_payload(
        self,
        file_meta: dict = {},
        request_headers: dict = {}
    ) -> None:
        self.meta = FileMeta(file_meta)
        self.headers = Headers(request_headers)

        self.headers.validate()

    def _create_file(self, chunk: UploadFile) -> ObjectId:
        return self._fs.upload_from_stream_with_id(
            file_id=self.file_id,
            filename="test_file",
            source=chunk.file,
            metadata=self.meta.get()
        )

    def _append_file(self, chunk: UploadFile) -> ObjectId | None:
        try:
            previous_file = self._fs.open_download_stream(self.file_id)

            new_item = {
                "file_id": previous_file._id,
                "filename": previous_file.name,
                "source": previous_file.read() + chunk.file,
                "metadata": self.meta.get()
            }

            self._fs.delete(previous_file._id)

            return self._fs.upload_from_stream_with_id(**new_item)

        except NoFile: self._create_file(chunk)


class FileStreaming:
    slots = (
        'RANGE_RE',
        'CHUNK_SIZE',
        'file',
        'file_size',
        'content_type',
        'range_match',
        'chunk_start',
        'chunk_end',
        'chunk_length'
    )
    RANGE_RE = compile(r"bytes\s*=\s*(\d+)\s*-\s*(\d*)", I)
    MB_MULTIPLIER = 4
    CHUNK_SIZE = 1024 * MB_MULTIPLIER

    def __init__(self, file):
        self.file = file
        self.file_size = self.file.path.size
        self.content_type = self._get_file_type()
        self._set_chunks()

    # def get_reponse(self, request):
    #     self.range_match = self._get_range_match(request)

    #     if self.range_match:
    #         self._set_chunks()

    #         response = FileResponse(iter(self), status=206)
    #         response['Content-Range'] = f'bytes {self.chunk_start}-{self.chunk_end}/{self.file_size}'

    #     else: response = FileResponse(self.file.path.open())

    #     response['Content-Type'] = self.content_type
    #     response['Accept-Ranges'] = 'bytes'

    #     return response

    # def __iter__(self): return self._file_iterator()

    # def _file_iterator(self):
    #     with self.file.path.open() as file:
    #         file.seek(self.chunk_start, SEEK_SET)
    #         remaining_chunk = self.chunk_length

    #         while True:
    #             bytes_length = (
    #                 self.CHUNK_SIZE
    #                 if remaining_chunk is None
    #                 else min(remaining_chunk, self.CHUNK_SIZE)
    #             )
    #             data = file.read(bytes_length)

    #             if not data: break
    #             if remaining_chunk: remaining_chunk -= len(data)

    #             yield data

    # def _get_file_type(self):
    #     if '.' not in self.file.file_name: return self.file.file_type

    #     type = self.file.file_name.split('.')[-1]
    #     return f'{self.file.file_type}/{type}'

    # def _get_range_match(self, request):
    #     range_header = request.headers.get('range', '')
    #     return self.RANGE_RE.match(range_header)

    # def _set_chunks(self):
    #     chunk_start, chunk_end = (
    #         self.range_match.groups()
    #         if self.__dict__.get('range_match')
    #         else (0, 0)
    #     )

    #     chunk_start = int(chunk_start) if chunk_start else 0
    #     chunk_end = (
    #         int(chunk_end) if chunk_end
    #         else chunk_start + 1024 * 1024 * self.MB_MULTIPLIER
    #     )

    #     if chunk_end >= self.file_size: chunk_end = self.file_size - 1

    #     chunk_length = chunk_end - chunk_start + 1

    #     self.chunk_start = chunk_start
    #     self.chunk_end = chunk_end
    #     self.chunk_length = chunk_length
