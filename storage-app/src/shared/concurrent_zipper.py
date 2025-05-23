from multiprocessing import Process, Queue as MQueue
from threading import Lock, Thread
from queue import Queue as TQueue
from motor.core import AgnosticBaseCursor
from shared.storage_db import DataBase
from gridfs import GridOut
from gc import collect as gc_collect
from zipfile import ZIP64_LIMIT, ZIP_FILECOUNT_LIMIT, _Extra  # type: ignore
from struct import pack as pack_data, pack_into
from io import BytesIO
from time import localtime
from zlib import compress
from binascii import crc32
from asyncio import FIRST_COMPLETED, create_task, wait, get_running_loop
from typing import Callable, Any, cast, Optional
from os import cpu_count
from datetime import datetime
from .settings import TEMP_BUCKET


CENT_DIR_STRUCT: str = "<IHHHHHHIIIHHHHHII"
CENT_DIR_STRUCT_EXTRA: Callable[[int], str] = lambda n: "<HH" + "Q" * n
LOCAL_FILE_STRUCT: str = "<IHHHHHIIIHH"
LOCAL_FILE_STRUCT_EXTRA: str = "<HHQQ"
CENTRAL_STRUCT: int = 0x02014b50
LOCAL_STRING: int = 0x04034b50
ZIP_VERSION: int = 20
COMPRESSION_METHOD: int = 8
COMPRESSION_LEVEL: int = 6
LOCAL_HEADER_LEN: int = 30
CENTDIR_HEADER_LEN: int = 46
ZIP64_VERSION: int = 45
END_64_STRUCT_LOC: str = "<4sLQL"
END_64_STRING_LOC: bytes = b"PK\x06\x07"
END_64_STRUCT: str = "<4sQ2H2L4Q"
END_64_STRING: bytes = b"PK\x06\x06"
END_STRUCT: bytes = b"<4s4H2LH"
END_STRING: bytes = b"PK\005\006"
POOL_SIZE: int = cast(int, cpu_count())
MAX_READ_CONCURRENCY: int = 256
DUMP_THRESHOLD: int = 20 << 20
GC_FREQ: int = 256


class Consumer(Process):
    __slots__ = (
        "_file_list",
        "_queue",
        "_file_queue",
        "_local_dir_end",
        "_lock",
    )

    def __init__(self, process_queue: MQueue, file_queue: MQueue):
        super().__init__()

        self._file_list = []
        self._queue = process_queue
        self._file_queue = file_queue
        self._local_dir_end = 0
        self._lock = None

    def tell(self) -> int: return self._local_dir_end

    def _dump_buffer(self, buffer: BytesIO, file_list: list):
        dest_offset = self.tell()

        for zinfo in file_list: zinfo.header_offset += dest_offset

        with cast(Lock, self._lock):
            self._file_list += file_list
            self._local_dir_end += buffer.tell()

        self._file_queue.put((buffer, buffer.tell()))

    def _finalize(self):
        self._write_cent_dir(end_buffer := BytesIO())
        self._file_queue.put((end_buffer, end_buffer.tell()))

        self._write_end_record(
            self.tell() + end_buffer.tell(),
            self.tell(),
            len(self._file_list),
            cent_dir_buffer := BytesIO()
        )
        self._file_queue.put((cent_dir_buffer, cent_dir_buffer.tell()))

    def _write_cent_dir(self, buffer: BytesIO):
        for zinfo in self._file_list:
            extra = []
            extra_data = b""

            if zinfo.file_size > ZIP64_LIMIT:
                extra.append(zinfo.file_size)
                zinfo.file_size = 0xffffffff

            if zinfo.compress_size > ZIP64_LIMIT:
                extra.append(zinfo.compress_size)
                zinfo.compress_size = 0xffffffff

            if zinfo.header_offset > ZIP64_LIMIT:
                extra.append(zinfo.header_offset)
                zinfo.header_offset = 0xffffffff

            if extra:
                extra_data = _Extra.strip(zinfo.extra, (1,))
                extra_data = pack_data(CENT_DIR_STRUCT_EXTRA(len(extra)), 1, 8 * len(extra), *extra) + extra_data

            centdir = bytearray(CENTDIR_HEADER_LEN + len(zinfo.filename) + len(extra_data))

            pack_into(
                CENT_DIR_STRUCT,
                centdir,
                0,
                CENTRAL_STRUCT,
                ZIP64_VERSION if extra else ZIP_VERSION,
                ZIP64_VERSION if extra else ZIP_VERSION,
                0,
                COMPRESSION_METHOD,
                zinfo.dostime,
                zinfo.dosdate,
                zinfo.crc32,
                zinfo.compress_size,
                zinfo.file_size,
                len(zinfo.filename),
                len(extra_data),
                0,
                0,
                zinfo.internal_attr,
                zinfo.external_attr,
                zinfo.header_offset
            )

            centdir[CENTDIR_HEADER_LEN:] = zinfo.filename
            centdir[CENTDIR_HEADER_LEN + len(zinfo.filename):] = extra_data

            buffer.write(centdir)

    def _write_end_record(self, pos: int, start_dir: int, d_size: int, buffer: BytesIO):
        cent_dir = pos - start_dir

        if d_size > ZIP_FILECOUNT_LIMIT or pos > ZIP64_LIMIT:
            pack = (END_64_STRUCT, END_64_STRING, 44, 45, 45, 0, 0, d_size, d_size, cent_dir, start_dir)
            buffer.write(pack_data(*pack))
            buffer.write(pack_data(END_64_STRUCT_LOC, END_64_STRING_LOC, 0, pos, 1))
            cent_dir = min(cent_dir, 0xffffffff)
            start_dir = min(start_dir, 0xffffffff)
            d_size = min(d_size, 0xffff)

        buffer.write(pack_data(END_STRUCT, END_STRING, 0, 0, d_size, d_size, cent_dir, start_dir, 0))

    def _write_local_file(
        self,
        dest: BytesIO,
        file_list: list,
        file_name: str,
        file_data: bytes
    ):
        dt = localtime()

        dosdate = (dt[0] - 1980) << 9 | dt[1] << 5 | dt[2]
        dostime = dt[3] << 11 | dt[4] << 5 | (dt[5] // 2)
        crc32_info = crc32(file_data) & 0xffffffff
        compressed_data = compress(file_data, level=COMPRESSION_LEVEL)[2:-4]
        encoded_name = file_name.encode("ascii")
        extra = b""

        file_size = len(file_data)
        compressed_size = len(compressed_data)

        if (is_z64 := len(file_data) >= 0xffffffff):
            extra = pack_data(LOCAL_FILE_STRUCT_EXTRA, 0x0001, 16, file_size, compressed_size)
            file_size = compressed_size = 0xffffffff

        local_file = bytearray(LOCAL_HEADER_LEN + len(encoded_name) + len(extra))

        pack_into(
            LOCAL_FILE_STRUCT,
            local_file,
            0,
            LOCAL_STRING,
            ZIP64_VERSION if is_z64 else ZIP_VERSION,
            0,
            COMPRESSION_METHOD,
            dostime,
            dosdate,
            crc32_info,
            compressed_size,
            file_size,
            len(encoded_name),
            len(extra)
        )

        local_file[LOCAL_HEADER_LEN:] = encoded_name
        local_file[LOCAL_HEADER_LEN + len(encoded_name):] = extra

        file_list.append(type("file", (object,), {
            "dosdate": dosdate,
            "dostime": dostime,
            "filename": encoded_name,
            "flag_bits": 0x00,
            "header_offset": dest.tell(),
            "crc32": crc32_info,
            "compress_size": len(compressed_data),
            "file_size": len(file_data),
            "internal_attr": 0,
            "external_attr": 0,
            "compress_type": ZIP64_VERSION if is_z64 else ZIP_VERSION,
            "extra": extra
        }))

        dest.write(local_file)
        dest.write(compressed_data)

    def run(self):
        def _target(local_queue: TQueue):
            buffer = BytesIO()
            file_list = []

            while (task := local_queue.get()):
                f_name, f_data = task
                self._write_local_file(buffer, file_list, f_name, f_data)

                del f_data

                if buffer.tell() > DUMP_THRESHOLD:
                    self._dump_buffer(buffer, file_list)
                    buffer = BytesIO()
                    file_list = []

            if buffer.tell(): self._dump_buffer(buffer, file_list)

        self._lock = Lock()

        pool = [
            (lq := TQueue(), Thread(target=_target, args=[lq]))
            for _ in range(POOL_SIZE)
        ]

        [item[1].start() for item in pool]

        counter = 0
        while (task := self._queue.get()):
            pool[counter % POOL_SIZE][0].put(task)
            counter += 1

        [tq.put(None) or t.join() for tq, t in pool]

        self._finalize()

        self._file_queue.put(None)


class Producer:
    __slots__ = (
        "_process_queue",
        "_file_queue",
        "_source_sets",
        "_additional",
        "_dest_name",
        "_iter_count",
        "_archive_id",
        "_archive_size"
    )

    def __init__(
        self,
        process_queue: MQueue,
        file_queue: MQueue,
        source_sets: list[AgnosticBaseCursor],
        additional: list[tuple[str, bytes]],
        dest_name: str,
    ):
        self._process_queue = process_queue
        self._file_queue = file_queue
        self._source_sets = source_sets
        self._additional = additional
        self._dest_name = dest_name
        self._iter_count = 0
        self._archive_id = None
        self._archive_size = 0

    async def start(self):
        tasks = []
        write_task = create_task(self.write_task())

        for cursor in self._source_sets:
            while await cursor.fetch_next:
                file = cursor.next_object()
                tasks.append(create_task(self.next(file)))

                if len(tasks) >= MAX_READ_CONCURRENCY:
                    await wait(tasks, return_when=FIRST_COMPLETED)
                    tasks = [task for task in tasks if not task.done()]

                self._iter_count += 1
                if not self._iter_count % GC_FREQ: gc_collect()

        [await task for task in tasks]
        [self._process_queue.put(add) for add in self._additional]
        self._process_queue.put(None)
        await write_task

    async def next(self, file: GridOut):
        payload = (self._get_file_name(file), await cast(Any, file.read()))
        try: self._process_queue.put(payload)
        except Exception as e: print(f"next err {str(e)}")

    def _get_file_name(self, file: GridOut) -> str:
        ext = cast(dict, file.metadata).get("file_extension", "")
        return str(file._id) + (f".{ext}" * bool(ext))

    async def write_task(self):
        async def get_next():
            loop = get_running_loop()
            return await loop.run_in_executor(None, self._file_queue.get)

        now = datetime.now().isoformat()
        dest = DataBase.get_fs_bucket(TEMP_BUCKET) \
            .open_upload_stream(self._dest_name, metadata={"created_at": now})

        while (task := await get_next()):
            buffer, read_size = task
            buffer.seek(0)
            self._archive_size += read_size

            await dest.write(buffer.read(read_size))

            del buffer

        self._archive_id = dest._id

        await dest.close()

    @property
    def result(self) -> Optional[dict[str, Any]]:
        if not self._archive_id: return None
        return {
            "zip_id": str(self._archive_id),
            "f_count": self._iter_count,
            "size": self._archive_size
        }
