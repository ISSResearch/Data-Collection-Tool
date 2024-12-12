from typing_extensions import Coroutine
from videohash import VideoHash
from videohash.utils import (
    create_and_return_temporary_directory as mk_temp_dir,
    does_path_exists
)
from PIL import Image
from PIL.ImageFile import ImageFile
from os.path import join, sep, exists
from pathlib import Path
from asyncio import run
from motor.motor_asyncio import AsyncIOMotorGridOut
from shared.settings import HASH_SIZE, TEMP_HASH_PATH, MEDIA_SIZE
from numpy import asarray, float32, ndarray
from io import BytesIO
from scipy.fftpack import dct
from typing import Any

Image.ANTIALIAS = Image.Resampling.LANCZOS


def to_embedding(
    image: ImageFile,
    embedding_type="dctlowfreq",
    size=MEDIA_SIZE,
) -> ndarray:
    prep_image = image.convert("L").resize((size, size), Image.ANTIALIAS)
    raw_emdedding = asarray(prep_image)

    _dct = lambda: dct(dct(raw_emdedding, axis=0), axis=1)
    _as_result = lambda arr: arr.flatten().astype(float32)

    match embedding_type:
        case "dct": return _as_result(_dct())
        case "dctlowfreq": return _as_result(_dct()[:HASH_SIZE, :HASH_SIZE])
        case "raw":
            assert MEDIA_SIZE == HASH_SIZE, "item_resize must be equal to 'HASH_SIZE' setting"
            return _as_result(raw_emdedding)
        case _: raise ValueError("Unsupported embedding type")


class IHash:
    embedding: ndarray
    _file: AsyncIOMotorGridOut

    def __init__(self, file: AsyncIOMotorGridOut):
        self._file = file
        self.embedding = self._get_hash()

    def _get_hash(self) -> ndarray:
        run(self._get_buffer())
        image = Image.open(self._buffer)
        return to_embedding(image)

    async def _get_buffer(self):
        self._file.seek(0)
        self._buffer = BytesIO(await self._file.read())


class VHash(VideoHash):
    embedding: ndarray
    _file: AsyncIOMotorGridOut

    def __init__(self, file: AsyncIOMotorGridOut):
        self._file = file
        super().__init__(storage_path=TEMP_HASH_PATH)
        self.delete_storage_path()

    def _calc_hash(self): self.embedding = to_embedding(self.image)

    def _create_required_dirs_and_check_for_errors(self):
        if not exists(self.storage_path): self.storage_path = mk_temp_dir()

        assert does_path_exists(self.storage_path), f"Storage path '{self.storage_path}' does not exist."

        self.storage_path = join(self.storage_path, (f"{self.task_uid}{sep}"))

        self.video_dir = join(self.storage_path, (f"video{sep}"))
        Path(self.video_dir).mkdir(parents=True, exist_ok=True)

        self.video_download_dir = join(self.storage_path, (f"downloadedvideo{sep}"))
        Path(self.video_download_dir).mkdir(parents=True, exist_ok=True)

        self.frames_dir = join(self.storage_path, (f"frames{sep}"))
        Path(self.frames_dir).mkdir(parents=True, exist_ok=True)

        self.tiles_dir = join(self.storage_path, (f"tiles{sep}"))
        Path(self.tiles_dir).mkdir(parents=True, exist_ok=True)

        self.collage_dir = join(self.storage_path, (f"collage{sep}"))
        Path(self.collage_dir).mkdir(parents=True, exist_ok=True)

        self.horizontally_concatenated_image_dir = join(
            self.storage_path,
            f"horizontally_concatenated_image{sep}"
        )
        Path(self.horizontally_concatenated_image_dir).mkdir(
            parents=True,
            exist_ok=True
        )

    def _copy_video_to_video_dir(self):
        assert self._file.metadata, "No file meta to read"

        extension = self._file.metadata.get("file_extension")
        self.video_path = join(self.video_dir, f"video.{extension}")

        run(self._write_file())

    async def _write_file(self):
        with open(self.video_path, "wb") as file:
            self._file.seek(0)
            file.write(await self._file.read())
