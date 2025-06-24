from fastapi import APIRouter
from shared.utils import emit_token
from shared.settings import SECRET_KEY, SECRET_ALGO


router = APIRouter(prefix="/api/temp_token")


@router.get("/")
def get_temp_token() -> str:
    return emit_token({"minutes": 5}, SECRET_KEY, SECRET_ALGO)
