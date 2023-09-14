from os import getenv
from os.path import sep, join, realpath


def get_db_uri() -> str:
    db_user = getenv("DB_USER")
    db_password = getenv("DB_PASSWORD")
    db_host = getenv("DB_HOST")
    db_port = 27017

    if not all((db_user, db_password, db_host, db_port)): raise AttributeError

    return f'mongodb://{db_user}:{db_password}@{db_host}:{db_port}/'


def get_path(from_dir: str = "") -> str:
    path_list = realpath("").split(sep)

    return "/" + (
        join(*path_list[:path_list.index(from_dir)])
        if from_dir in path_list
        else join(*path_list)
    )
