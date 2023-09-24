from fastapi import FastAPI, Request
from fastapi.responses import PlainTextResponse
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from shared.utils import get_db_uri
from shared.db_manager import DataBase
from router import file
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
APP.include_router(file.router)


@APP.middleware("http")
async def authenticate_request(request: Request, call_next):
    try:
        type, token = request.headers.get("authorization").split(" ")
        if type != "Bearer": raise JWTError
        user_data = jwt.decode(token, SECRET_KEY, algorithms=SECRET_ALGO)
        request.state.user = user_data
    except Exception: return PlainTextResponse(
        status_code=401,
        content="authentication failed",
        headers={"WWW-Authenticate": "Bearer"},
    )
    response = await call_next(request)
    return response


@APP.on_event("startup")
def startup(): database.get_db(DB_STORAGE)


@APP.on_event("shutdown")
def shutdown(): database.client.close()


if __name__ == "__main__": run(**UVICORN_CONF)
