from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse
from shared.models import UploadFile, Form, Annotated
from shared.app_services import Bucket, ObjectStreaming

router = APIRouter()


@router.get("/api/storage/{bucket_name}/{file_id}/")
def get_file(request: Request, bucket_name: str, file_id: str) -> StreamingResponse:
    project_bucket: Bucket = Bucket(bucket_name)

    stream: ObjectStreaming | None = project_bucket.get_object(file_id)

    return (
        stream.stream(request) if stream
        else StreamingResponse(iter(b""), status_code=404)
    )


@router.post("/api/storage/{bucket_name}/{file_id}/")
def upload_file(
    request: Request,
    bucket_name: str,
    file_id: str,
    file: UploadFile,
    file_meta: Annotated[str, Form()]
) -> JSONResponse:
    project_bucket: Bucket = Bucket(bucket_name)

    result, is_completed, status = project_bucket \
        .put_object(request, file_id, file, file_meta)

    return JSONResponse(status_code=status, content={
        "ok": result,
        "transfer_complete": is_completed
    })


@router.delete("/api/storage/{bucket_name}/{file_id}/")
def delete_file(bucket_name: str, file_id: str) -> JSONResponse:
    project_bucket: Bucket = Bucket(bucket_name)
    result: tuple = project_bucket.delete_object(file_id)

    return JSONResponse(content={"ok": True, "result": result})
