from multiprocessing import cpu_count
from os import getenv

DB_STORAGE = "storage"

BUCKET_PREFIX = "project_"

UVICORN_CONF = {
    "app": "main:APP",
    "workers": cpu_count() * 2 + 1,
    "host": '0.0.0.0',
    "port": 9000,
    "reload": getenv("DEBUG") == "true",
}
