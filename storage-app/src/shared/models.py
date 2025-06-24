from pydantic import BaseModel
from fastapi import UploadFile, Form
from typing import Annotated


class File(BaseModel):
    file: UploadFile
    file_meta: Annotated[str, Form()]
