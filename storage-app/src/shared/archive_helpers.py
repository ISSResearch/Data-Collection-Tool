from asyncio import FIRST_COMPLETED, create_task, wait
from typing import Optional
from threading import Thread
from queue import Queue
from gridfs import GridOut, GridIn
from typing import Any
from gridfs.synchronous.grid_file import Cursor
from shared.storage_db import SyncDataBase
from motor.core import AgnosticBaseCursor
from gc import collect as gc_collect
from .settings import ASYNC_PRODUCER_GC_FREQ as GC_FREQ, TEMP_BUCKET
from io import BufferedWriter, BytesIO
from struct import pack as pack_data
from datetime import datetime
from zipfile import (
    _Extra, # type: ignore
    ZIP64_LIMIT,
    ZIP_FILECOUNT_LIMIT,
    ZipFile,
    ZIP_DEFLATED,
)

CENTRAL_STRUCT = "<4s4B4HL2L5H2L"
CENTRAL_STRING = b"PK\001\002"
ZIP64_VERSION = 45
END_64_STRUCT_LOC = "<4sLQL"
END_64_STRING_LOC = b"PK\x06\x07"
END_64_STRUCT = "<4sQ2H2L4Q"
END_64_STRING = b"PK\x06\x06"
END_STRUCT = b"<4s4H2LH"
END_STRING = b"PK\005\006"


class ZipWriter(Thread):
    def __init__(self, file_name: str, as_file: bool = False):
        super().__init__()
        self.file_name = file_name
        self.queue = Queue()
        self._archive_id = None
        self._as_file = as_file
        self._done = False

    def stop(self): self.queue.put(None)

    def write(self, task: tuple[BytesIO, int]): self.queue.put(task)

    def result(self) -> Optional[str]: return self._archive_id

    @property
    def ready(self) -> bool: return self._done

    def _get_write_in(self):
        return (
            open(self.file_name, "wb")
            if self._as_file
            else SyncDataBase
            .get_fs_bucket(TEMP_BUCKET)
            .open_upload_stream(
                self.file_name,
                metadata={"created_at": datetime.now().isoformat()}
            )
        )

    def run(self):
        dest: GridIn | BufferedWriter = self._get_write_in()

        while True:
            if (task := self.queue.get()) is None: break

            buffer, read_size = task
            buffer.seek(0)
            data = buffer.read(read_size)

            dest.write(data)

            del buffer

        dest.close()

        if not self._as_file:
            self._archive_id = dest._id
            SyncDataBase.close_connection()

        self._done = True


class ZipConsumer(Thread):
    DUMP_THRESHOLD: int = 10 << 20

    def __init__(
        self,
        queue: Queue,
        additional: list[tuple[str, bytes]],
        writer: ZipWriter
    ):
        super().__init__()
        self.queue = queue
        self.additional = additional
        self.file_list = []
        self.writer = writer
        self._local_dir_end = 0
        self._done = False

    def tell(self) -> int: return self._local_dir_end

    @property
    def ready(self) -> bool: return self._done

    def _dump_buffer(self, buffer: BytesIO, zip_buffer: ZipFile):
        dest_offset = self.tell()

        new_list = zip_buffer.filelist
        for zinfo in new_list: zinfo.header_offset += dest_offset

        self.file_list += new_list
        self._local_dir_end += buffer.tell()

        self.writer.write((buffer, buffer.tell()))

        zip_buffer.close()

    def _finalize(self):
        self._write_end_record(end_buffer := BytesIO())
        self.writer.write((end_buffer, end_buffer.tell()))

        self._write_cent_dir(
            self.tell() + end_buffer.tell(),
            self.tell(),
            len(self.file_list),
            cent_dir_buffer := BytesIO()
        )
        self.writer.write((cent_dir_buffer, cent_dir_buffer.tell()))

        self.writer.stop()

    def _write_end_record(self, buffer: BytesIO):
        for zinfo in self.file_list:
            dt = zinfo.date_time

            dosdate = (dt[0] - 1980) << 9 | dt[1] << 5 | dt[2]
            dostime = dt[3] << 11 | dt[4] << 5 | (dt[5] // 2)
            extra = []

            assert zinfo.file_size <= ZIP64_LIMIT and zinfo.compress_size <= ZIP64_LIMIT

            file_size = zinfo.file_size
            compress_size = zinfo.compress_size

            if zinfo.header_offset > ZIP64_LIMIT:
                extra.append(zinfo.header_offset)
                header_offset = 0xffffffff
            else: header_offset = zinfo.header_offset

            extra_data = zinfo.extra
            min_version = 0

            if extra:
                extra_data = _Extra.strip(extra_data, (1,))
                extra_data = pack_data("<HH" + "Q" * len(extra), 1, 8 * len(extra), *extra) + extra_data

                min_version = ZIP64_VERSION

            extract_version = max(min_version, zinfo.extract_version)
            create_version = max(min_version, zinfo.create_version)

            filename, flag_bits = zinfo._encodeFilenameFlags()

            centdir = pack_data(
                CENTRAL_STRUCT,
                CENTRAL_STRING,
                create_version,
                zinfo.create_system,
                extract_version,
                zinfo.reserved,
                flag_bits,
                zinfo.compress_type,
                dostime,
                dosdate,
                zinfo.CRC,
                compress_size,
                file_size,
                len(filename),
                len(extra_data),
                len(zinfo.comment),
                0,
                zinfo.internal_attr,
                zinfo.external_attr,
                header_offset
            )

            buffer.write(centdir + filename + extra_data + zinfo.comment)

    def _write_cent_dir(self, pos: int, start_dir: int, d_size: int, buffer: BytesIO):
        cent_dir = pos - start_dir

        if d_size > ZIP_FILECOUNT_LIMIT or pos > ZIP64_LIMIT:
            pack = (END_64_STRUCT, END_64_STRING, 44, 45, 45, 0, 0, d_size, d_size, 0, pos)
            buffer.write(pack_data(*pack))
            buffer.write(pack_data(END_64_STRUCT_LOC, END_64_STRING_LOC, 0, pos, 1))
            cent_dir = min(cent_dir, 0xFFFFFFFF)
            start_dir = min(start_dir, 0xFFFFFFFF)
            d_size = min(d_size, 0xFFFF)

        buffer.write(pack_data(END_STRUCT, END_STRING, 0, 0, d_size, d_size, cent_dir, start_dir, 0))

    def run(self):
        buffer = BytesIO()
        zip_buffer: ZipFile = ZipFile(buffer, "w", ZIP_DEFLATED)

        while True:
            if (task := self.queue.get()) is None: break

            f_name, f_data = task
            zip_buffer.writestr(f_name, f_data)

            del f_data

            if buffer.tell() > self.DUMP_THRESHOLD:
                self._dump_buffer(buffer, zip_buffer)
                buffer = BytesIO()
                zip_buffer = ZipFile(buffer, "w", ZIP_DEFLATED)

        for f_name, f_data in self.additional: zip_buffer.writestr(f_name, f_data)

        if buffer.tell(): self._dump_buffer(buffer, zip_buffer)

        self._finalize()

        self._done = True


class FileProducer:
    def __init__(
        self,
        object_set: AgnosticBaseCursor | Cursor,
        queue: Queue,
        max_concurrent: int
    ):
        self.object_set = object_set
        self.queue = queue
        self.max_concurrent = max_concurrent
        self._done = False
        self.iter_count = 0

    @property
    def ready(self) -> bool: return self._done

    def produce_sync(self):
        for file in self.object_set:
            self.queue.put((self._get_file_name(file), file.read()))
            self.iter_count += 1
            file.close()
            if not self.iter_count % GC_FREQ: gc_collect()

        self.queue.put(None)
        self._done = True

    async def produce(self):
        tasks = []

        while await self.object_set.fetch_next:
            file = self.object_set.next_object()
            tasks.append(create_task(self.next(file)))

            if len(tasks) >= self.max_concurrent:
                await wait(tasks, return_when=FIRST_COMPLETED)
                tasks = [task for task in tasks if not task.done()]

            self.iter_count += 1
            if not self.iter_count % GC_FREQ: gc_collect()

        for task in tasks: await task
        self.queue.put(None)

        self._done = True

    async def next(self, file: GridOut):
        try: self.queue.put((self._get_file_name(file), await file.read()))
        except Exception as e: print(f"next err {str(e)}")

    def _get_file_name(self, file: GridOut) -> str:
        name = str(file._id)
        extension = file.metadata.get("file_extension", "")

        if extension: name += f".{extension}"

        return name


class SyncZipping():
    DUMP_THRESHOLD: int = 10 << 20

    def __init__(
        self,
        dest_name: str,
        source_sets: list[Cursor],
        additional: list[tuple[str, bytes]]
    ):
        self.source_sets = source_sets
        self.additional = additional
        self.file_list = []
        self._local_dir_end = 0
        self._archive_id = None
        self.dest = SyncDataBase \
            .get_fs_bucket(TEMP_BUCKET) \
            .open_upload_stream(
                dest_name,
                metadata={"created_at": datetime.now().isoformat()}
            )

    def dest_write(self, buffer, read_size):
        buffer.seek(0)
        data = buffer.read(read_size)
        self.dest.write(data)

    def tell(self) -> int: return self._local_dir_end

    @property
    def result(self) -> Optional[dict[str, Any]]:
        if not self._archive_id: return None
        return {
            "zip_id": str(self._archive_id),
            "f_count": len(self.file_list),
            "size": self._archive_size
        }

    def _dump_buffer(self, buffer: BytesIO, zip_buffer: ZipFile):
        dest_offset = self.tell()

        new_list = zip_buffer.filelist
        for zinfo in new_list: zinfo.header_offset += dest_offset

        self.file_list += new_list
        self._local_dir_end += buffer.tell()

        self.dest_write(buffer, buffer.tell())

        zip_buffer.close()

    def _finalize(self):
        self._write_end_record(end_buffer := BytesIO())
        end_size = end_buffer.tell()
        self.dest_write(end_buffer, end_size)

        self._write_cent_dir(
            self.tell() + end_buffer.tell(),
            self.tell(),
            len(self.file_list),
            cent_dir_buffer := BytesIO()
        )
        cent_dir_size = cent_dir_buffer.tell()
        self.dest_write(cent_dir_buffer, cent_dir_size)

        self._archive_id = self.dest._id
        self._archive_size = self._local_dir_end + end_size + cent_dir_size

        self.dest.close()

        SyncDataBase.close_connection()

    def _write_end_record(self, buffer: BytesIO):
        for zinfo in self.file_list:
            dt = zinfo.date_time

            dosdate = (dt[0] - 1980) << 9 | dt[1] << 5 | dt[2]
            dostime = dt[3] << 11 | dt[4] << 5 | (dt[5] // 2)
            extra = []

            assert zinfo.file_size <= ZIP64_LIMIT and zinfo.compress_size <= ZIP64_LIMIT

            file_size = zinfo.file_size
            compress_size = zinfo.compress_size

            if zinfo.header_offset > ZIP64_LIMIT:
                extra.append(zinfo.header_offset)
                header_offset = 0xffffffff
            else: header_offset = zinfo.header_offset

            extra_data = zinfo.extra
            min_version = 0

            if extra:
                extra_data = _Extra.strip(extra_data, (1,))
                extra_data = pack_data("<HH" + "Q" * len(extra), 1, 8 * len(extra), *extra) + extra_data

                min_version = ZIP64_VERSION

            extract_version = max(min_version, zinfo.extract_version)
            create_version = max(min_version, zinfo.create_version)

            filename, flag_bits = zinfo._encodeFilenameFlags()

            centdir = pack_data(
                CENTRAL_STRUCT,
                CENTRAL_STRING,
                create_version,
                zinfo.create_system,
                extract_version,
                zinfo.reserved,
                flag_bits,
                zinfo.compress_type,
                dostime,
                dosdate,
                zinfo.CRC,
                compress_size,
                file_size,
                len(filename),
                len(extra_data),
                len(zinfo.comment),
                0,
                zinfo.internal_attr,
                zinfo.external_attr,
                header_offset
            )

            buffer.write(centdir + filename + extra_data + zinfo.comment)

    def _write_cent_dir(self, pos: int, start_dir: int, d_size: int, buffer: BytesIO):
        cent_dir = pos - start_dir

        if d_size > ZIP_FILECOUNT_LIMIT or pos > ZIP64_LIMIT:
            pack = (END_64_STRUCT, END_64_STRING, 44, 45, 45, 0, 0, d_size, d_size, 0, pos)
            buffer.write(pack_data(*pack))
            buffer.write(pack_data(END_64_STRUCT_LOC, END_64_STRING_LOC, 0, pos, 1))
            cent_dir = min(cent_dir, 0xFFFFFFFF)
            start_dir = min(start_dir, 0xFFFFFFFF)
            d_size = min(d_size, 0xFFFF)

        buffer.write(pack_data(END_STRUCT, END_STRING, 0, 0, d_size, d_size, cent_dir, start_dir, 0))

    def run(self):
        buffer = BytesIO()
        zip_buffer: ZipFile = ZipFile(buffer, "w", ZIP_DEFLATED)

        for source in self.source_sets:
            for file in source:
                f_name, ext = str(file._id), file.metadata.get("file_extension", "")
                if ext: f_name += f".{ext}"

                f_data = file.read()

                zip_buffer.writestr(f_name, f_data)

                if buffer.tell() > self.DUMP_THRESHOLD:
                    self._dump_buffer(buffer, zip_buffer)
                    buffer = BytesIO()
                    zip_buffer = ZipFile(buffer, "w", ZIP_DEFLATED)

            source.close()

        for f_name, f_data in self.additional: zip_buffer.writestr(f_name, f_data)

        if buffer.tell(): self._dump_buffer(buffer, zip_buffer)

        self._finalize()
