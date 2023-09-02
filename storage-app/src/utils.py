from os import getenv


def get_db_uri() -> str:
    db_user = getenv("DB_USER")
    db_password = getenv("DB_PASSWORD")
    db_host = getenv("DB_HOST")
    db_port = 27017

    if not all((db_user, db_password, db_host, db_port)): raise AttributeError

    return f'mongodb://{db_user}:{db_password}@{db_host}:{db_port}/'
