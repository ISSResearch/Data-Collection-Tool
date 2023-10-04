from os import getenv
from os.path import sep, join, realpath
from bson import ObjectId
from bson.errors import InvalidId
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Any
from fastapi import Request
from shared.settings import SECRET_ALGO, SECRET_KEY, APP_BACKEND_URL
from requests import get, Response, ConnectTimeout
from time import sleep


def get_db_uri() -> str:
    db_user: str = getenv("DB_USER", "")
    db_password: str = getenv("DB_PASSWORD", "")
    db_host: str = getenv("DB_HOST", "")
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


def emit_token(
    delta: dict,
    secret: str,
    algorithm: str,
    payload: dict[str, Any] = {}
) -> str:
    time_now: datetime = datetime.utcnow()

    token_data: dict[str, Any] = {
        "token_type": "access",
        "exp": time_now + timedelta(**delta),
        "iat": time_now,
        "jti": f"emited-token-{time_now}",
        **payload
    }

    return jwt.encode(token_data, secret, algorithm)


def parse_request_for_jwt(request: Request) -> dict[str, Any]:
    request_token: str = (
        "Bearer " + request.url.query.split("=")[1]
        if request.url.query
        else request.headers.get("authorization")
    )

    token_type, token = request_token.split(" ")

    if token_type != "Bearer": raise JWTError

    return jwt.decode(token, SECRET_KEY, algorithms=SECRET_ALGO)


def healthcheck_backend_app() -> bool:
    url: str = APP_BACKEND_URL + "/api/users/check/"

    payload_token: str = emit_token(
        {"minutes": 1},
        SECRET_KEY,
        SECRET_ALGO,
        {"user_id": 1, "is_superuser": True}
    )

    headers: dict[str, Any] = {"Authorization": "Bearer " + payload_token}

    for attempt_n in range(5):
        print(f"backend app healthcheck attempt {attempt_n + 1}...")

        sleep(3)

        try:
            response: Response = get(url, headers=headers)

            if response.status_code == 200 and response.json()["isAuth"]: return True

        except ConnectTimeout: continue

    return False
