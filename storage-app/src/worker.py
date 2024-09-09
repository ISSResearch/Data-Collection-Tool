from celery import Celery
from shared.settings import BROKER_URL, RESULT_URL, CELERY_CONFIG
from shared.worker_services import Zipper, Hasher
from asyncio import get_event_loop

if not BROKER_URL or not RESULT_URL: raise ValueError("no broker environment")

worker: Celery = Celery()

worker.conf.broker_url = BROKER_URL
worker.conf.result_backend = RESULT_URL


@worker.task(name="produce_download_task")
def produce_download_task(bucket_name: str, file_ids: list[str]) -> str | None:
    task = Zipper(bucket_name, file_ids)
    loop = get_event_loop()

    async def _inner():
        await task.archive_objects()
        await task.write_archive()
        task.delete_temp_zip()

    loop.run_until_complete(_inner())
    return task.archive_id


@worker.task(name="produce_handle_media_task")
def produce_handle_media_task(bucket_name: str, uid: str) -> None:
    loop = get_event_loop()
    task = Hasher(bucket_name, uid)

    async def _inner():
        await task.get_file()
        task.hash()
        task.search_similar()
        task.handle_search_result()
        task.send_update(task.file_id, task.status)

    loop.run_until_complete(_inner())


if __name__ == "__main__": worker.worker_main(argv=CELERY_CONFIG)
