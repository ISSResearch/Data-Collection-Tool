from celery import Celery
from shared.settings import BROKER_URL, RESULT_URL, CELERY_CONFIG
from shared.worker_services import Zipper
from asyncio import get_event_loop

if not BROKER_URL or not RESULT_URL: raise ValueError("no broker environment")

WORKER: Celery = Celery()

WORKER.conf.broker_url = BROKER_URL
WORKER.conf.result_backend = RESULT_URL


@WORKER.task(name="produce_download_task")
def produce_download_task(bucket_name: str, file_ids: list[str]) -> str | None:
    zipper: Zipper = Zipper(bucket_name, file_ids)
    loop = get_event_loop()

    async def _inner():
        await zipper.archive_objects()
        await zipper.write_archive()
        zipper.delete_temp_zip()

    loop.run_until_complete(_inner())
    return zipper.archive_id


if __name__ == "__main__": WORKER.worker_main(argv=CELERY_CONFIG)
