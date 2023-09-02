from multiprocessing import cpu_count
from os import getenv


RAW_ORIGIN = getenv('SERVER_ORIGINS')
SELF_ORIGIN = []

if RAW_ORIGIN:
    RAW_ORIGIN = RAW_ORIGIN.replace(' ', '').split(',')
    SELF_ORIGIN = [f"http://{origin}:3000" for origin in RAW_ORIGIN]

DB_STORAGE = "storage"

BUCKET_PREFIX = "project_"

UVICORN_CONF = {
    "app": "main:APP",
    "workers": cpu_count() * 2 + 1,
    "host": '0.0.0.0',
    "port": 9000,
    "reload": getenv("DEBUG") == "true",
}

CHUNK_SIZE = 1024 * int(1024 / 2)
