from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, StreamingResponse
from shared.models import UploadFile, Form, Annotated
from shared.app_services import Bucket, ObjectStreaming

router = APIRouter(prefix="/api/storage")


@router.get("/{bucket_name}/{file_id}/")
async def get_file(
    request: Request,
    bucket_name: str,
    file_id: str
) -> StreamingResponse:
    project_bucket: Bucket = Bucket(bucket_name)
    stream: ObjectStreaming | None = await project_bucket.get_object(file_id)

    return (
        stream.stream(request) if stream
        else StreamingResponse(iter(b""), status_code=404)
    )


@router.post("/{bucket_name}/")
async def upload_file(
    bucket_name: str,
    file: UploadFile,
    file_meta: Annotated[str, Form()]
) -> JSONResponse:
    project_bucket: Bucket = Bucket(bucket_name)
    result, status = await project_bucket.put_object(file, file_meta)

    return JSONResponse(status_code=status, content={"result": result})


@router.delete("/{bucket_name}/{file_id}/")
async def delete_file(bucket_name: str, file_id: str) -> JSONResponse:
    project_bucket: Bucket = Bucket(bucket_name)
    result, message = await project_bucket.delete_object(file_id)

    return JSONResponse(
        content={"ok": result, "result": message},
        status_code=200 if result else 404
    )
