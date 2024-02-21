from celery import Celery
from shared.settings import BROKER_URL, RESULT_URL, CELERY_CONFIG
from shared.worker_services import Zipper

if not BROKER_URL or not RESULT_URL: raise ValueError("no broker environment")

WORKER: Celery = Celery()

WORKER.conf.broker_url = BROKER_URL
WORKER.conf.result_backend = RESULT_URL


@WORKER.task(name="produce_download_task")
async def produce_download_task(bucket_name: str, file_ids: list[int]) -> str | None:
    zipper: Zipper = Zipper(bucket_name, file_ids)

    await zipper.archive_objects()
    zipper.write_archive()
    zipper.delete_temp_zip()

    return zipper.archive_id


if __name__ == "__main__": WORKER.worker_main(argv=CELERY_CONFIG)
