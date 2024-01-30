from multiprocessing import cpu_count
from os import getenv
from typing import Any

max_workers: int = int(getenv("MAX_WORKER", 0))
available_workers: int = cpu_count() * 2 + 1

WORKERS: int = (
    max_workers
    if max_workers and (available_workers > max_workers)
    else available_workers
)

DEBUG: bool = getenv("DEBUG") == "true"

APP_BACKEND_URL: str = "http://" + getenv("APP_BACKEND_URL", "127.0.0.1")
SECRET_KEY: str = getenv("SECRET_KEY", "")
SECRET_ALGO: str = getenv("SECRET_ALGO", "HS256")

BUCKET_PREFIX: str = "project_"
TEMP_BUCKET: str = "temp_storage"

BROKER_URL: str | None = getenv("CELERY_BROKER_URL")
RESULT_URL: str | None = BROKER_URL

CHUNK_SIZE: int = 1024 * int(1024 / 2)

DB_STORAGE: str = "storage"

RAW_ORIGIN: str | list[str] | None = getenv('SERVER_ORIGINS')
SELF_ORIGIN: list[str] = []

if RAW_ORIGIN:
    RAW_ORIGIN = RAW_ORIGIN.replace(' ', '').split(',')
    SELF_ORIGIN = [f"http://{origin}:3000" for origin in RAW_ORIGIN]

UVICORN_CONF: dict[str, Any] = {
    "app": "app:APP",
    "workers": WORKERS,
    "host": '0.0.0.0',
    "port": 9000,
    "reload": DEBUG,
    "log_level": "debug" if DEBUG else "critical"
}

CELERY_CONFIG: list[str] = ["worker", "--loglevel=INFO"]
