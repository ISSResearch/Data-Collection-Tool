from pydantic import BaseModel
from fastapi import UploadFile


class File(BaseModel):
    chunk: UploadFile
    file_meta: dict
