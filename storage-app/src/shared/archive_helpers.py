from asyncio import create_task, wait, FIRST_COMPLETED, gather
from zipfile import ZipFile, ZIP_DEFLATED
from threading import Thread
from queue import Queue
from gridfs import GridOut
from motor.core import AgnosticBaseCursor
from gc import collect as gc_collect
from .settings import ASYNC_PRODUCER_GC_FREQ as GC_FREQ
from io import BufferedWriter, BytesIO


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

    def _dump_buffer(self, dest: BufferedWriter, buffer: BytesIO):
        print("dump", buffer.tell())
        buffer.seek(0)
        dest.write(buffer.read())
        buffer.seek(0)
        buffer.truncate(0)

    def run(self):
        buffer = BytesIO()
        zip_buffer = ZipFile(self.path, "w", ZIP_DEFLATED)
        # zip_file = open(self.path, "wb")

        first = False

        while True:
            if (task := self.queue.get()) is None: break

            if not first:
                print("consume first")
                first = True

            f_name, f_data = task
            zip_buffer.writestr(f_name, f_data)

            del f_data

            # if buffer.tell() > (50 << 20): self._dump_buffer(zip_file, buffer)

        for f_name, f_data in self.additional: zip_buffer.writestr(f_name, f_data)

        # if buffer.tell(): self._dump_buffer(zip_file, buffer)

        zip_buffer.close()
        buffer.close()
        #zip_file.close()


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
