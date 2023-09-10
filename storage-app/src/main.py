from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from settings import UVICORN_CONF, SELF_ORIGIN
from router import file
from utils import get_db_uri
from settings import DB_STORAGE
from db_manager import DataBase

database = DataBase(get_db_uri())

APP = FastAPI(docs_url=None, redoc_url=None)
APP.add_middleware(
    CORSMiddleware,
    allow_origins=SELF_ORIGIN,
    allow_credentials=True,
    allow_methods=["get", "post", "delete", "option"],
    allow_headers=["*"]
)
APP.include_router(file.router)


@APP.on_event("startup")
def startup(): database.get_db(DB_STORAGE)


@APP.on_event("shutdown")
def shutdown(): database.client.close()


@APP.get('/ping')
def index(request: Request): return "pong"




from pydantic import BaseModel
class some(BaseModel):
    file: int
    meta: str

@APP.post('/ping')
def index2(request: Request, some: some):
    print(type(some.file), some.meta)
    return "pong"



if __name__ == "__main__": run(**UVICORN_CONF)
