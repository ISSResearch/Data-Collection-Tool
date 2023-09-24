from os import getenv
from os.path import sep, join, realpath
from bson import ObjectId
from bson.errors import InvalidId


def get_db_uri() -> str:
    db_user: str | None = getenv("DB_USER")
    db_password: str | None = getenv("DB_PASSWORD")
    db_host: str | None = getenv("DB_HOST")
    db_port: int = 27017

    if not all((db_user, db_password, db_host, db_port)): raise AttributeError

    return f'mongodb://{db_user}:{db_password}@{db_host}:{db_port}/'


def get_path(from_dir: str = "") -> str:
    path_list: list[str] = realpath("").split(sep)

    return "/" + (
        join(*path_list[:path_list.index(from_dir)])
        if from_dir in path_list
        else join(*path_list)
    )


def get_object_id(object_id: str) -> str | ObjectId:
    try: return ObjectId(object_id)
    except InvalidId: return object_id
