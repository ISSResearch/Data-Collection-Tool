from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from shared.settings import UVICORN_CONF, SELF_ORIGIN, DB_STORAGE
from shared.utils import get_db_uri
from shared.db_manager import DataBase
from router import file


database = DataBase(get_db_uri())

APP = FastAPI(docs_url=None, redoc_url=None)
APP.add_middleware(CORSMiddleware, allow_origins=SELF_ORIGIN)
APP.include_router(file.router)


@APP.on_event("startup")
def startup(): database.get_db(DB_STORAGE)


@APP.on_event("shutdown")
def shutdown(): database.client.close()


if __name__ == "__main__": run(**UVICORN_CONF)
