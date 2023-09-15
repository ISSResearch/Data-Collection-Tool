from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from shared.models import Downloads, UploadFile, Form, Annotated
from shared.app_services import Bucket
from worker import produce_download_task, WORKER

router = APIRouter()


@router.get("/api/bucket/{bucket_name}/file/{file_id}")
def get_file(request: Request, bucket_name: str, file_id: int) -> JSONResponse:
    project_bucket = Bucket(bucket_name)

    stream = project_bucket.get_object(file_id)

    return (
        stream.stream(request) if stream
        else JSONResponse(content={"ok": False, "message": "no such file"})
    )


@router.post("/api/bucket/{bucket_name}/file/{file_id}")
def upload_file_chunkma(
    request: Request,
    bucket_name: str,
    file_id: int,
    # TODO: rewrite into model
    file: UploadFile,
    file_meta: Annotated[str, Form()]
) -> JSONResponse:
    project_bucket = Bucket(bucket_name)
    result, status = project_bucket.put_object(request, file_id, file, file_meta)
    return JSONResponse(status_code=status, content={"ok": result})


@router.delete("/api/bucket/{bucket_name}/file/{file_id}")
def delete_file(bucket_name: str, file_id: int) -> JSONResponse:
    project_bucket = Bucket(bucket_name)
    result = project_bucket.delete_object(file_id)

    return JSONResponse(content={"ok": True, "result": result})


@router.post("/api/bucket/{bucket_name}/download")
def download_bucket(bucket_name: str, object_ids: Downloads) -> JSONResponse:
    task = produce_download_task.delay(bucket_name, object_ids.file_ids)

    return JSONResponse(content={"task_id": task.id})


@router.get("/api/task/{task_id}")
def check_task_status(task_id: str) -> JSONResponse:
    task = WORKER.AsyncResult(task_id)
    response = {"task_id": task_id, "status": task.status}

    if task.status == "SUCCESS": response["archive_id"] = task.result

    return JSONResponse(content=response)
