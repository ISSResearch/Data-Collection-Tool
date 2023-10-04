from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from typing import Any
from router import storage, task
from shared.db_manager import DataBase
from shared.utils import (
    get_db_uri,
    emit_token,
    parse_request_for_jwt,
    healthcheck_backend_app
)
from shared.settings import (
    UVICORN_CONF,
    SELF_ORIGIN,
    DB_STORAGE,
    SECRET_KEY,
    SECRET_ALGO
)

database: DataBase = DataBase(get_db_uri())

APP: FastAPI = FastAPI(docs_url="/docs", redoc_url=None)

APP.add_middleware(CORSMiddleware, allow_origins=SELF_ORIGIN)

APP.include_router(storage.router)
APP.include_router(task.router)


@APP.on_event("startup")
def startup():
    if not healthcheck_backend_app(): raise ConnectionError
    database.set_db(DB_STORAGE)


@APP.on_event("shutdown")
def shutdown():
    if database.client: database.client.close()


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


@APP.get("/api/temp_token/")
def get_temp_token() -> str:
    return emit_token({"minutes": 5}, SECRET_KEY, SECRET_ALGO)


if __name__ == "__main__": run(**UVICORN_CONF)
