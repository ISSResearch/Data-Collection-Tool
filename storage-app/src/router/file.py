from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from settings import BUCKET_PREFIX
from models import File, Downloads
from db_manager import DataBase

router = APIRouter()


@router.get("/api/{project_id}/file/{file_id}")
def get_file(request: Request, project_id: str, file_id: int) -> dict:
    project_bucket = DataBase.get_bucket(BUCKET_PREFIX + project_id)

    stream = project_bucket.get_object(file_id)

    return stream.stream(request)


@router.post("/api/{project_id}/file/{file_id}}")
def upload_file_chunk(
    request: Request,
    project_id: str,
    file_id: int,
    file: File
) -> dict:
    project_bucket = DataBase.get_bucket(BUCKET_PREFIX + project_id)
    result, status = project_bucket.put_object(request, file_id, file)

    return JSONResponse(status_code=status, content={"ok": result})


@router.delete("/api/{project_id}/file/{file_id}")
def delete_file(project_id: str, file_id: int):
    project_bucket = DataBase.get_bucket(BUCKET_PREFIX + project_id)
    result = project_bucket.delete_object(file_id)

    return JSONResponse(content={"ok": True, "result": result})


@router.post("/api/{project_id}/download")
def download_project(project_id: str, objects: Downloads):
    project_bucket = DataBase.get_bucket(BUCKET_PREFIX + project_id)
    project_bucket.download_objects(objects)

    return JSONResponse(content={"ok": True})
