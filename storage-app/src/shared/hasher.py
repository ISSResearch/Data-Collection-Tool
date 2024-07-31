from imagehash import whash, ImageHash
from videohash import VideoHash
from videohash.utils import (
    create_and_return_temporary_directory as mk_temp_dir,
    does_path_exists
)
from PIL import Image
from os.path import join, sep
from pathlib import Path
from asyncio import get_event_loop
from motor.motor_asyncio import AsyncIOMotorGridOut

Image.ANTIALIAS = Image.Resampling.LANCZOS


class VHashPatch(VideoHash):
    hash: ImageHash
    _file: AsyncIOMotorGridOut

    def __init__(self, *args, **kwargs):
        file, *_ = args
        self._file = file
        super().__init__(*args, **kwargs)

    def _calc_hash(self): self.hash = whash(self.image)

    def _create_required_dirs_and_check_for_errors(self):
        if not self.storage_path: self.storage_path = mk_temp_dir()

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

        get_event_loop().run_until_complete(self._write_file())

    async def _write_file(self):
        with open(self.video_path, "wb") as file:
            self._file.seek(0)
            file.write(await self._file.read())
