from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from shared.utils import get_db_uri, emit_token
from shared.db_manager import DataBase
from router import storage, task
from jose import JWTError, jwt
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


@APP.middleware("http")
async def authenticate_request(request: Request, call_next):
    try:
        request_token = (
            "Bearer " + request.url.query.split("=")[1]
            if request.url.query
            else request.headers.get("authorization")
        )

        token_type, token = request_token.split(" ")

        if token_type != "Bearer": raise JWTError

        token_data = jwt.decode(token, SECRET_KEY, algorithms=SECRET_ALGO)
        request.state.token_data = token_data

    except Exception: return PlainTextResponse(
        status_code=401,
        content="authentication failed",
        headers={"WWW-Authenticate": "Bearer"},
    )

    response = await call_next(request)

    return response


@APP.on_event("startup")
def startup(): database.set_db(DB_STORAGE)


@APP.on_event("shutdown")
def shutdown(): database.client.close()


@APP.get("/api/temp_token/")
def get_temp_token() -> str:
    return emit_token({"minutes": 5}, SECRET_KEY, SECRET_ALGO)


if __name__ == "__main__": run(**UVICORN_CONF)
