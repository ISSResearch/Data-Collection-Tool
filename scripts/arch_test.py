from shared.app_services import Bucket
from shared.archive_helpers import FileProducer, ZipConsumer, ZipFile, ZIP_DEFLATED, ZipWriter
from queue import Queue
from asyncio import get_event_loop
from time import perf_counter


async def seq_write():
    t0 = perf_counter()
    c = 0
    object_set = Bucket("project_10")._fs.find({})

    with ZipFile("seq_arch.zip", "w", ZIP_DEFLATED) as zip:
        try:
            while object := await object_set.next():
                c+= 1
                zip.writestr(str(c), object.read())
        except StopAsyncIteration: pass
        finally: await object_set.close()
    return perf_counter() - t0, c


async def async_write():
    t0 = perf_counter()
    queue = Queue()
    object_set = Bucket("project_10")._fs.find({})

    producer = FileProducer(object_set, queue, 1_000)
    writer = ZipWriter("async_arch.zip", True)
    consumer = ZipConsumer(queue, [], writer)

    writer.start()
    consumer.start()

    await producer.produce()
    await object_set.close()

    consumer.join()
    writer.join()
    return perf_counter() - t0, 0


run = lambda fn: get_event_loop().run_until_complete(fn())


def perf_check(fn, n):
    res = []
    written = 0
    for i in range(n):
        print(f"{fn.__name__} run#{i}")

        secs, files = run(fn)
        res.append(secs)
        written = files

    mx = max(res)
    mn = min(res)
    avg = sum(res) / n

    print(f"FN: {fn.__name__}\nMAX: {mx}\nMIN: {mn}\nAVG: {avg}\nFILES: {written}")
