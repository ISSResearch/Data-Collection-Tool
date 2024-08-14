from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from typing_extensions import Optional, Any
from shared.settings import DB_STORAGE
from shared.storage_db import DataBase
from shared.embedding_db import EmdeddingStorage
from shared.utils import (
    get_db_uri,
    parse_request_for_jwt,
    healthcheck_backend_app
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("App start. Checking up resources")

    database: Optional[DataBase] = None

    try:
        assert healthcheck_backend_app(), "Could'nt connect to main backend"

        database = DataBase(get_db_uri())
        database.set_db(DB_STORAGE)

        with EmdeddingStorage() as storage: storage.migrate()

    except Exception as e:
        print("Startup error: " + str(e))
        exit(1)

    yield

    print("App end. Cleaning up resources")
    database.close_connection()


class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            token_data: dict[str, Any] = parse_request_for_jwt(request)
            request.state.token_data = token_data

        except Exception: return Response(
            status_code=401,
            content="authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

        return await call_next(request)
