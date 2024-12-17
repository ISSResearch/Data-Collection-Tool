from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from worker import produce_download_task

router = APIRouter(prefix="/api/task")


@router.post("/archive/{bucket_id}/")
async def archive_bucket(request: Request, bucket_id: int) -> JSONResponse:
    annotation = await request.json()
    task = produce_download_task.delay(bucket_id, annotation)
    return JSONResponse(content={"task_id": task.id}, status_code=201)
