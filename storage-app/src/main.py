from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from router.storage import router as storage_router
from router.task import router as task_router
from router.token import router as token_router
from shared.settings import UVICORN_CONF, SELF_ORIGIN
from shared.setup import AuthMiddleware, lifespan

app: FastAPI = FastAPI(docs_url="/docs", redoc_url=None, lifespan=lifespan)

app.add_middleware(CORSMiddleware, allow_origins=SELF_ORIGIN)
app.add_middleware(AuthMiddleware)

app.include_router(storage_router)
app.include_router(task_router)
app.include_router(token_router)

if __name__ == "__main__": run(**UVICORN_CONF)
