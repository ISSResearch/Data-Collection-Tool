from fastapi import FastAPI, Request, UploadFile
from uvicorn import run
from settings import UVICORN_CONF, DB_STORAGE
from utils import get_db_uri
from db_manager import DataBase

APP = FastAPI()
db = DataBase(get_db_uri())


@APP.get('/')
def index(request: Request):
    return {"reponse": 'some response message!'}


@APP.post("/api/upload")
async def upload_chunk(request: Request, chunk: UploadFile, file_meta: object):
    project = db.get_bucket(DB_STORAGE + "project_id")
    result, status = project.put_object(chunk, file_meta, request.headers)

    return {"ok": result, "status": status}


if __name__ == "__main__": run(**UVICORN_CONF)
