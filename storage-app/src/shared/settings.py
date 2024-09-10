from multiprocessing import cpu_count
from os import getenv, listdir
from os.path import abspath, join, curdir
from typing import Any, Optional

max_workers: int = int(getenv("MAX_WORKER", 0))
available_workers: int = cpu_count() * 2 + 1

WORKERS: int = (
    max_workers
    if max_workers and (available_workers > max_workers)
    else available_workers
)

DEBUG: bool = getenv("DEBUG") == "true"

FRONTEND_PORT: Optional[str] = getenv("FRONTEND_PORT")
STORAGE_PORT: Optional[str] = getenv("STORAGE_PORT")

assert STORAGE_PORT

APP_BACKEND_URL: str = "http://" + getenv("APP_BACKEND_URL", "127.0.0.1")
SECRET_KEY: str = getenv("SECRET_KEY", "")
SECRET_ALGO: str = getenv("SECRET_ALGO", "HS256")

BUCKET_PREFIX: str = "project_"
TEMP_BUCKET: str = "temp_storage"
TEMP_HASH_PATH: str = join(abspath(curdir), "temp_hash")
TEMP_ZIP: str = join(abspath(curdir), "temp_zip")
EMBEDDING_STORAGE_PATH: str = join(abspath(curdir), "embedding_storage.db")

sqlite_vector_shared, *_ = [name for name in listdir() if "vec0" in name] + [""]
SQLITE_VECTOR_PATH = join(abspath(curdir), sqlite_vector_shared)

BROKER_URL: str | None = getenv("CELERY_BROKER_URL")
RESULT_URL: str | None = BROKER_URL

CHUNK_SIZE: int = 1024 * 512

MEDIA_SIZE: int = 64
HASH_SIZE: int = 16

# Tuned for i16 dct low freq
# other options:
#     i32 raw pixels: 10.
#     i64 raw pixels: 100.
# so far dct fow freq i16 showed the most optimal results
# on 8.5k dataset of static videos (filming static objects over ~5secs)
# i64 raw had most similarities found but with completely different video included
# i32 raw had 1 more item compared to dct but overall its identical
# since i32 takes x3 memory i'll stick with dct
# RESULTS (n is the number of similarities found for some embedding):
# raw i64 (t=100) | raw i32 (t=10) | dctlowfreq (t=1000) | comment
# 11              |  11            | 11                  | same objects
# 1               |  1             | x                   | same objects
# 2               |  x             | x                   | same objects
# 5               |  x             | x                   | same scene but content differs (moving grass, shadows etc)
# 2               |  x             | x                   | completely different objects
SIMILAR_THRESHOLD: float = 1000.

DB_STORAGE: str = "storage"

RAW_ORIGIN: str | list[str] | None = getenv('SERVER_ORIGINS')
SELF_ORIGIN: list[str] = []

if RAW_ORIGIN:
    RAW_ORIGIN = RAW_ORIGIN.replace(' ', '').split(',')
    SELF_ORIGIN = [f"http://{origin}:{FRONTEND_PORT}" for origin in RAW_ORIGIN]

UVICORN_CONF: dict[str, Any] = {
    "app": "main:app",
    "workers": WORKERS,
    "host": '0.0.0.0',
    "port": int(STORAGE_PORT),
    "reload": DEBUG,
    "log_level": "debug" if DEBUG else "critical"
}

CELERY_CONFIG: list[str] = ["worker", "--loglevel=INFO"]
