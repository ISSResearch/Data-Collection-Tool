class Headers:
    headers_fields = ("chunk", "total_chunks")

    def __init__(self, data):
        self._headers = data
        self.is_valid = False

    def validate(self):
        self.chunk = self._headers.get("chunk")
        self.total_chunks = self._headers.get("total_chunks")
        self.is_valid = self.chunk and self.total_chunks

    @property
    def is_new(self): return not self.chunk or self.chunk == 1

    @property
    def is_last_chunk(self):
        return self.is_valid and self.chunk == self.total_chunks


class FileMeta:
    meta_fields = ("file_name", "file_extension", "file_type", "file_id")

    def __init__(self, data):
        self._meta = data
        self.is_valid = False

    def validate(self):
        validator = "no-id-found"
        if self._meta.get("file_id", validator) == validator: raise AttributeError

    def get(self):
        return {
            meta_name: self._meta.get(meta_name)
            for meta_name in self.meta_fields
            if meta_name != "file_id"
        }

    @property
    def file_id(self): self._meta.file_id


class FileManager:
    __slots__ = ("_fs", "meta", "headers")

    def put_object(self, chunk, file_meta, request_headers):
        self._prepare_payload(file_meta, request_headers)

        try:
            if self.headers.is_new: self._create_file(chunk)
            else: self._append_file(chunk)

            return True, 201 if self.headers.is_new else 202

        except Exception: return False, 400

    def _prepare_payload(self, file_meta={}, request_headers={}):
        self.meta = FileMeta(file_meta)
        self.headers = Headers(request_headers)

        self.meta.validate()
        self.headers.validate()

    def _create_file(self, chunk):
        return self._fs.upload_from_stream_with_id(
            file_id=self.meta.file_id,
            filename="test_file",
            source=chunk,
            metadata=self.meta.get()
        )

    def _append_file(self, chunk):
        previous_file = self._fs.open_download_stream(self.meta.file_id)

        new_item = {
            "file_id": previous_file._id,
            "filename": previous_file.name,
            "source": previous_file.read() + chunk,
            "metadata": self.meta.get()
        }

        self._fs.delete(previous_file._id)

        return self._fs.upload_from_stream_with_id(**new_item)
