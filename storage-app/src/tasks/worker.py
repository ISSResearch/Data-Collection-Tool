from celery import Celery
import time

if __name__ == "__main__":
    from settings import CELERY_CONFIG, BROKER_URL, RESULT_URL
    from services import * # noqa
else:
    from tasks.settings import CELERY_CONFIG, BROKER_URL, RESULT_URL
    from tasks.services import * # noqa

if not BROKER_URL or not RESULT_URL: raise ValueError("no broker variables")

WORKER = Celery()
WORKER.conf.broker_url = BROKER_URL
WORKER.conf.result_backend = RESULT_URL


@WORKER.task(name="produce_download_task")
def produce_download_task(files: list) -> list:
    time.sleep(20)
    return files


if __name__ == "__main__": WORKER.worker_main(argv=CELERY_CONFIG)
