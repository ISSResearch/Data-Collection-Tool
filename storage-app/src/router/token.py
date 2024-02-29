from fastapi import APIRouter
from shared.utils import emit_token
from shared.settings import SECRET_KEY, SECRET_ALGO


router = APIRouter()


@router.get("/api/temp_token/")
def get_temp_token() -> str:
    return emit_token({"minutes": 5}, SECRET_KEY, SECRET_ALGO)
