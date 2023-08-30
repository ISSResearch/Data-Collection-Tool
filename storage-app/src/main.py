from fastapi import FastAPI, Request, UploadFile
from gridfs import GridFS
from pymongo import MongoClient
from uvicorn import run
from settings import uvicorn_conf, get_db_uri

APP = FastAPI()
mongo_client = MongoClient(get_db_uri())
db = mongo_client.files
fs = GridFS(db)


@APP.get('/')
def index(request: Request, a: int, b: str):
    return {"reponse": 'some response message!', 'a': a, 'b': b}


@APP.post("/api/upload")
async def upload_chunk(
    chunk: UploadFile,
    filename: str,
    chunk_index: int,
    total_chunks: int
):
    with chunk.file as chunk_data:
        fs.put(chunk_data.read(), filename=filename, chunkIndex=chunk_index)

    return {"message": "Chunk uploaded successfully"}


if __name__ == "__main__": run(**uvicorn_conf)
