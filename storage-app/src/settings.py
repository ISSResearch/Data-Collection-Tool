from multiprocessing import cpu_count
from os import getenv

uvicorn_conf = {
    "app": "main:APP",
    "workers": cpu_count() * 2 + 1,
    "host": '0.0.0.0',
    "port": 9000,
    "reload": getenv("DEBUG") == "true",
}

def get_db_uri():
    db_user = getenv("DB_USER")
    db_password = getenv("DB_PASSWORD")
    db_host = getenv("DB_HOST")
    db_port = 27017
    return f'mongodb://{db_user}:{db_password}@{db_host}:{db_port}/'
