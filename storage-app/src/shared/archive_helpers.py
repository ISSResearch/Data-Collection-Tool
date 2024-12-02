from asyncio import create_task, wait, FIRST_COMPLETED, gather
from zipfile import ZipFile, ZIP_DEFLATED
from threading import Thread
from queue import Queue
from gridfs import GridOut
from motor.core import AgnosticBaseCursor
from gc import collect as gc_collect
from .settings import ASYNC_PRODUCER_GC_FREQ as GC_FREQ
from io import BufferedWriter, BytesIO
from struct import pack as pack_data
from zipfile import _Extra, ZIP64_LIMIT, ZIP_FILECOUNT_LIMIT

CENTRAL_STRUCT = "<4s4B4HL2L5H2L"
CENTRAL_STRING = b"PK\001\002"
ZIP64_VERSION = 45
END_64_STRUCT_LOC = "<4sLQL"
END_64_STRING_LOC = b"PK\x06\x07"
END_64_STRUCT = "<4sQ2H2L4Q"
END_64_STRING = b"PK\x06\x06"
END_STRUCT = b"<4s4H2LH"
END_STRING = b"PK\005\006"


class ZipConsumer(Thread):
    def __init__(
        self,
        path: str,
        queue: Queue,
        additional: list[tuple[str, bytes]]
    ):
        super().__init__()
        self.queue = queue
        self.path = path
        self.additional = additional
        self.file_list = []

    def _dump_buffer(self, dest: BufferedWriter, buffer: BytesIO, zip_buffer: ZipFile):
        self.file_list += zip_buffer.filelist

        dest.write(buffer.getvalue())
        buffer.seek(0)
        buffer.truncate(0)
        dest.flush()

    def _finalize(self, dest: BufferedWriter):
        buffer = BytesIO()

        with ZipFile(buffer, "w") as zip_buffer:
            zip_buffer.start_dir = dest.tell()
            zip_buffer.filelist = self.file_list
            zip_buffer._write_end_record()

            dest.write(buffer.getvalue())

        dest.close()
        buffer.close()

    def _write_end_record(self, buffer):
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
                extra_data = pack_data('<HH' + 'Q'*len(extra), 1, 8*len(extra), *extra) + extra_data

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

            buffer.write(centdir, filename, extra_data, zinfo.comment)

    def _write_cent_dir(self, f_size, d_size, buffer):
        if d_size > ZIP_FILECOUNT_LIMIT or f_size > ZIP64_LIMIT:
            pack = (END_64_STRUCT, END_64_STRING, 44, 45, 45, 0, 0, d_size, d_size, 0, f_size)
            buffer.write(pack_data(*pack))
            buffer.write(pack_data(END_64_STRUCT_LOC, END_64_STRING_LOC, 0, f_size, 1))
            d_size = min(d_size, 0xFFFF)

        buffer.write(pack_data(END_STRUCT, END_STRING, 0, 0, d_size, d_size, 0, f_size, 0))

    def run(self):
        buffer = BytesIO()
        zip_buffer: ZipFile = ZipFile(buffer, "w", ZIP_DEFLATED)
        zip_file = open(self.path, "wb")

        while True:
            if (task := self.queue.get()) is None: break

            f_name, f_data = task
            zip_buffer.writestr(f_name, f_data)

            del f_data

            if buffer.tell() > (100 << 20):
                self._dump_buffer(zip_file, buffer, zip_buffer)
                zip_buffer = ZipFile(buffer, "w", ZIP_DEFLATED)

        for f_name, f_data in self.additional: zip_buffer.writestr(f_name, f_data)

        if buffer.tell(): self._dump_buffer(zip_file, buffer, zip_buffer)

        zip_buffer.close()
        buffer.close()

        self._finalize(zip_file)


class FileProducer:
    def __init__(
        self,
        object_set: AgnosticBaseCursor,
        queue: Queue,
        max_concurrent: int
    ):
        self.object_set = object_set
        self.queue = queue
        self.max_concurrent = max_concurrent

    async def produce(self):
        tasks = []
        iter_count = 0

        while await self.object_set.fetch_next:
            file = self.object_set.next_object()
            tasks.append(create_task(self.next(file, iter_count)))

            if len(tasks) >= self.max_concurrent:
                await wait(tasks, return_when=FIRST_COMPLETED)
                tasks = [task for task in tasks if not task.done()]

            iter_count += 1
            if not iter_count % GC_FREQ: gc_collect()

        await gather(*tasks)
        self.queue.put(None)
        print("produced last")
        self.count = iter_count

    async def next(self, file, iter_count):
        try:
            self.queue.put((self._get_file_name(file), await file.read()))
            if iter_count == 0: print("produced first")
        except Exception as e: print(f"next err {str(e)}")

    def _get_file_name(self, file: GridOut) -> str:
        name = str(file._id)
        extension = file.metadata.get("file_extension", "")

        if extension: name += f".{extension}"

        return name
