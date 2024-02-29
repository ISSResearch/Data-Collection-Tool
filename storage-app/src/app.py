from sys import exit
from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from typing import Any
from router import storage, task, token
from shared.db_manager import DataBase
from shared.utils import (
    get_db_uri,
    parse_request_for_jwt,
    healthcheck_backend_app
)
from shared.settings import UVICORN_CONF, SELF_ORIGIN, DB_STORAGE

APP: FastAPI = FastAPI(docs_url="/docs", redoc_url=None)

APP.add_middleware(CORSMiddleware, allow_origins=SELF_ORIGIN)

APP.include_router(storage.router)
APP.include_router(task.router)
APP.include_router(token.router)


@APP.on_event("startup")
def startup():
    if not healthcheck_backend_app():
        print("healthcheck failed. Could'nt connect to main backend")
        exit(1)

    global database
    database = DataBase(get_db_uri())
    database.set_db(DB_STORAGE)


@APP.on_event("shutdown")
def shutdown(): database.close_connection()


@APP.middleware("http")
async def authenticate_request(request: Request, call_next):
    try:
        token_data: dict[str, Any] = parse_request_for_jwt(request)
        request.state.token_data = token_data

    except Exception: return PlainTextResponse(
        status_code=401,
        content="authentication failed",
        headers={"WWW-Authenticate": "Bearer"},
    )

    response = await call_next(request)

    return response


if __name__ == "__main__": run(**UVICORN_CONF)
