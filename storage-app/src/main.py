from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from uvicorn import run
from settings import UVICORN_CONF, SELF_ORIGIN
from router import file
from utils import get_db_uri
from settings import DB_STORAGE
from tasks.worker import produce_download_task
from db_manager import DataBase
from fastapi.responses import HTMLResponse

database = DataBase(get_db_uri())

APP = FastAPI(docs_url=None, redoc_url=None)
APP.add_middleware(
    CORSMiddleware,
    allow_origins=SELF_ORIGIN,
    allow_credentials=True,
    allow_methods=["get", "post", "delete", "option"],
    allow_headers=["*"]
)
APP.include_router(file.router)


@APP.on_event("startup")
def startup(): database.get_db(DB_STORAGE)


@APP.on_event("shutdown")
def shutdown(): database.client.close()


@APP.get("/ping")
def x(request: Request):
    r = produce_download_task.delay([1, 2, 3])
    return {
        "id": r.id,
        "res": r.result
    }


@APP.get("/")
async def main():
    content = """
        <body>
            <style>
                form {
                    display: flex;
                    flex-direction: column;
                    width: 340px;
                    gap: 20px;
                }
            </style>
            <form onsubmit="hand(event, this)">
                <input name="num", type="int">
                <input id="a" name="file" type="file" multiple>
                <input type="submit">
            </form>
            <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
            <script>
            const hand = async (e, f) => {
                e.preventDefault();
                const [file] = f.file.files
                const [type, extension] = file.type.split('/');
                if (!file || !type || !extension) return;

                const chunkSize = 1024 * 1024 * 4;
                const numOfChunks = Math.ceil(file.size / chunkSize);

                for (let i = 0; i < numOfChunks; i++) {
                    const chunk = file.slice(i * chunkSize, chunkSize * (i + 1));

                    console.log(`sending chunk ${i} of ${numOfChunks}`);

                    const d = await axios.post(
                        'http://localhost:9000/api/bucket/1/file/' + f.num.value,
                        {
                            file: chunk,
                            file_meta: JSON.stringify({
                                file_name: file.name,
                                file_extension: extension,
                                file_type: type
                            })
                        }, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                'Chunk': i + 1,
                                'Total-Chunks': numOfChunks
                            },
                        }
                    );
                    console.log("response", d);
                }
            }
            </script>
        </body>
    """
    return HTMLResponse(content=content)


if __name__ == "__main__": run(**UVICORN_CONF)
