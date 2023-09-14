from multiprocessing import cpu_count
from os import getenv

BUCKET_PREFIX = "project_"
TEMP_BUCKET = "temp_storage"

BROKER_URL = getenv("CELERY_BROKER_URL")
RESULT_URL = getenv("CELERY_RESULT_BACKEND")

CHUNK_SIZE = 1024 * int(1024 / 2)

DB_STORAGE = "storage"

RAW_ORIGIN = getenv('SERVER_ORIGINS')
SELF_ORIGIN = []

if RAW_ORIGIN:
    RAW_ORIGIN = RAW_ORIGIN.replace(' ', '').split(',')
    SELF_ORIGIN = [f"http://{origin}:3000" for origin in RAW_ORIGIN]

UVICORN_CONF = {
    "app": "app:APP",
    "workers": cpu_count() * 2 + 1,
    "host": '0.0.0.0',
    "port": 9000,
    "reload": getenv("DEBUG") == "true",
}

CELERY_CONFIG = ["worker", "--loglevel=INFO"]
