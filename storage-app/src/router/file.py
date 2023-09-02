from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse
from settings import BUCKET_PREFIX
from models import File
from db_manager import DataBase
from services import FileStreaming

router = APIRouter()


@router.get("/api/file/{file_id}")
def get_file(file_id: int) -> dict:
    project = DataBase.get_bucket(BUCKET_PREFIX + "project_id")

    file = project.open_download_stream(file_id)
    stream = FileStreaming(file)

    return StreamingResponse(stream, media_type=file.metadata.file_type)


@router.post("/api/file/{file_id}}")
def upload_file_chunk(request: Request, file_id: int, file: File) -> dict:
    project = DataBase.get_bucket(BUCKET_PREFIX + "project_id")
    result, status = project.put_object(request, file_id, file)

    return JSONResponse(status_code=status, content={"ok": result})
