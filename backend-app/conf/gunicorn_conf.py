from multiprocessing import cpu_count
from os import mkdir, getenv
from os.path import exists

max_workers: int = int(getenv("MAX_WORKER", 0))
available_workers: int = cpu_count() * 2 + 1

app_port = getenv("BACKEND_PORT")
assert app_port

workers: int = (
    max_workers
    if max_workers
    and (available_workers > max_workers)
    else available_workers
)

keepalive: int = 5
timeout: int = 180
graceful_timeout: int = 180
limit_request_fields: int = 32000
limit_request_field_size: int = 0
user: str = "root"
raw_env: str = "DJANGO_SETTINGS_MODULE=proj_back.settings"
bind: str = "0.0.0.0:" + app_port
worker_tmp_dir: str = "./worker_tmp"

if not exists(worker_tmp_dir): mkdir(worker_tmp_dir)
