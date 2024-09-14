from celery import Celery
from shared.settings import BROKER_URL, RESULT_URL, CELERY_CONFIG
from shared.worker_services import Zipper, Hasher, EmbeddingStatus
from asyncio import get_event_loop
from typing import Optional, Any
from json import JSONEncoder, loads, dumps
from kombu.serialization import register

if not BROKER_URL or not RESULT_URL: raise ValueError("no broker environment")


class Encoder(JSONEncoder):
    def default(self, o) -> Any: return getattr(o, "__json__", super().default)(o)


worker: Celery = Celery()

worker.conf.broker_url = BROKER_URL
worker.conf.result_backend = RESULT_URL

register(
    "custom_encoder",
    lambda o: dumps(o, cls=Encoder),
    lambda o: loads(o),
    content_type="application/json",
)


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


@worker.task(name="produce_handle_media_task", serializer="custom_encoder")
def produce_handle_media_task(
    bucket_name: str,
    uid: str
) -> tuple[str, Optional[EmbeddingStatus], Optional[str]]:
    task = Hasher(bucket_name, uid)

    task.get_file()
    task.hash()
    task.search_similar()
    task.handle_search_result()

    assert task.process_result, "No search result"

    return task.process_result


if __name__ == "__main__": worker.worker_main(argv=CELERY_CONFIG)
