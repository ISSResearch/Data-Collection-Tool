from celery import Celery
from shared.settings import BROKER_URL, RESULT_URL, CELERY_CONFIG
from shared.worker_services import Zipper

if not BROKER_URL or not RESULT_URL: raise ValueError("no broker variables")

WORKER = Celery()
WORKER.conf.broker_url = BROKER_URL
WORKER.conf.result_backend = RESULT_URL


@WORKER.task(name="produce_download_task")
def produce_download_task(bucket_name: str, file_ids: list[int]):
    zipper = Zipper(bucket_name, file_ids)
    zipper.archive_objects()
    zipper.write_archive()

    return zipper.archive_id


if __name__ == "__main__": WORKER.worker_main(argv=CELERY_CONFIG)
