from celery import Celery
from time import sleep
from shared.settings import BROKER_URL, RESULT_URL, CELERY_CONFIG
from shared.worker_services import Zipper # noqa

if not BROKER_URL or not RESULT_URL: raise ValueError("no broker variables")

WORKER = Celery()
WORKER.conf.broker_url = BROKER_URL
WORKER.conf.result_backend = RESULT_URL


@WORKER.task(name="produce_download_task")
def produce_download_task(files: list) -> list:
    sleep(30)

    # zipper = Zipper(files)
    # zipper.archive_objects()
    # zipper.write_archive()

    # return zipper._archive_id

    return files


if __name__ == "__main__": WORKER.worker_main(argv=CELERY_CONFIG)
