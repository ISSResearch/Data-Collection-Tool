from fastapi import APIRouter
from fastapi.responses import JSONResponse
from typing import Any
from shared.models import ArchiveTask
from worker import produce_download_task, WORKER
from celery.result import AsyncResult

router = APIRouter()


@router.post("/api/task/archive/")
def archive_bucket(request_task: ArchiveTask) -> JSONResponse:
    task: AsyncResult = produce_download_task.delay(
        request_task.bucket_name,
        request_task.file_ids
    )

    return JSONResponse(content={"task_id": task.id})


# TODO: didint find the way to check if no such task
@router.get("/api/task/{task_id}/")
def check_task_status(task_id: str) -> JSONResponse:
    task: AsyncResult = WORKER.AsyncResult(task_id)
    response: dict[str, Any] = {"task_id": task_id, "status": task.status}

    if task.status == "SUCCESS": response["archive_id"] = task.result

    return JSONResponse(content=response)
