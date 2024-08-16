from fastapi import APIRouter
from fastapi.responses import JSONResponse
from typing import Any
from shared.models import ArchiveTask
from worker import produce_download_task, worker
from celery.result import AsyncResult

router = APIRouter(prefix="/api/task")


@router.post("/archive/")
def archive_bucket(request_task: ArchiveTask) -> JSONResponse:
    task: AsyncResult = produce_download_task.delay(
        request_task.bucket_name,
        request_task.file_ids
    )

    return JSONResponse(content={"task_id": task.id}, status_code=201)


# TODO: find the way to check if no such task
@router.get("/{task_id}/")
def check_task_status(task_id: str) -> JSONResponse:
    task: AsyncResult = worker.AsyncResult(task_id)
    response: dict[str, Any] = {"task_id": task_id, "status": task.status}

    if task.status == "SUCCESS": response["archive_id"] = task.result

    return JSONResponse(content=response)
