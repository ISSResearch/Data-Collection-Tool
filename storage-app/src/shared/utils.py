from os import getenv
from os.path import sep, join, realpath
from bson import ObjectId
from bson.errors import InvalidId
from jose import jwt, JWTError
from datetime import datetime, timedelta
from typing import Any
from fastapi import Request
from shared.settings import SECRET_ALGO, SECRET_KEY, APP_BACKEND_URL
from requests import Response, ConnectTimeout, ConnectionError
import requests
from time import sleep


def get_db_uri() -> str:
    db_user: str = getenv("DB_USER", "")
    db_password: str = getenv("DB_PASSWORD", "")
    db_host: str = getenv("DB_HOST", "")
    db_port: int = 27017

    if not all((db_user, db_password, db_host, db_port)): raise AttributeError

    return f"mongodb://{db_user}:{db_password}@{db_host}:{db_port}/"


def get_path(from_dir: str = "") -> str:
    path_list: list[str] = realpath("").split(sep)

    return "/" + (
        join(*path_list[:path_list.index(from_dir)])
        if from_dir and from_dir in path_list
        else join(*path_list)
    )


def get_object_id(object_id: str) -> str | ObjectId:
    try: return ObjectId(object_id)
    except InvalidId: return object_id


def emit_token(
    delta: dict[str, int],
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
        "Bearer " + query_token
        if (query_token := request.query_params.get("access"))
        else request.headers.get("authorization")
    )

    if " " not in request_token: raise JWTError

    token_type, token = request_token.split(" ")

    if token_type != "Bearer" or not token: raise JWTError

    return jwt.decode(token, SECRET_KEY, algorithms=SECRET_ALGO)


def healthcheck_backend_app() -> bool:
    url: str = APP_BACKEND_URL + "/api/users/check/"

    payload_token: str = emit_token(
        {"minutes": 1},
        SECRET_KEY,
        SECRET_ALGO,
    )

    headers: dict[str, Any] = {"Authorization": "Internal " + payload_token}

    for attempt_n in range(5):
        print(f"1/2 backend app healthcheck attempt {attempt_n + 1}...")

        sleep(3)

        try:
            response: Response = requests.get(url, headers=headers)

            if response.status_code == 200 and response.json().get("isAuth"):
                print("2/2 healthcheck passed!")
                return True

        except (ConnectTimeout, ConnectionError): continue

    return False
