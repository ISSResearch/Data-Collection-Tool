from shared.storage_db import DataBase
from shared.utils import get_db_uri, emit_token
from shared.settings import DB_STORAGE, SECRET_KEY, SECRET_ALGO, APP_BACKEND_URL
from shared.worker_services import Hasher
from shared.hasher import VHash, Image, BytesIO, to_embedding
from asyncio import new_event_loop, gather
from os.path import join
from requests import patch


class VHP(VHash):
    def _copy_video_to_video_dir(self):
        assert self._file.metadata, "No file meta to read"

        extension = self._file.metadata.get("file_extension")
        self.video_path = join(self.video_dir, f"video.{extension}")

        self._write_file()

    def _write_file(self):
        with open(self.video_path, "wb") as file:
            self._file.seek(0)
            file.write(self._file.read())


class HasherPatch(Hasher):
    @staticmethod
    def send_update(file_id, status=None, rebound=None):
        payload_token = emit_token({"minutes": 1}, SECRET_KEY, SECRET_ALGO)
        payload = {}

        if rebound: payload["rebound"] = rebound

        if not status and not rebound: return

        print(f"\nid: {file_id}, rebound: {rebound}\n")

        response = patch(
            APP_BACKEND_URL + f"/api/files/{file_id}/",
            headers={
                "Authorization": "Internal " + payload_token,
                "Content-Type": "application/json",
            },
            json=payload
        )

        assert response.status_code == 202, "File update was not accepted"

    def hash(self):
        match self.file.metadata.get("file_type"):
            case "image":
                self.file.seek(0)
                image = Image.open(BytesIO(self.file.read()))
                self.embedding = to_embedding(image)
            case "video": self.embedding = VHP(self.file).embedding
            case _: raise ValueError("Unsupported file type")


def process_file(bucket_name: str, file):
    uid = str(file._id)
    print(f"PROCESSING {uid} from {bucket_name} START")

    try:
        task = HasherPatch(bucket_name, uid)
        task.file = file

        task.hash()
        task.search_similar()
        task.handle_search_result()

        print(f"PROCESSING {uid} from {bucket_name} END:", task.process_result)
    except Exception as e: print(f"PROCESSING {uid} from {bucket_name} ERROR:", str(e))


async def process_bucket(bucket):
    _name = bucket.collection.name
    cursor = bucket.find()
    files = []
    try:
        print("PROCESSING START;", _name)
        while file := await cursor.next(): files.append(file)
    except StopAsyncIteration: print("PROCESSING END;", _name)

    return _name, files

async def get_files():
    db = DataBase(get_db_uri())
    db.set_db(DB_STORAGE)

    collections = await db._DataBase__current_db.list_collection_names()

    buckets = [
        p.split(".")[0] for p in collections
        if ".files" in p
        and "project_" in p
    ]

    tasks = [process_bucket(db.get_fs_bucket(B)) for B in buckets]

    return await gather(*tasks)



if __name__ == "__main__":
    files_res = new_event_loop().run_until_complete(get_files())

    [
        process_file(bucket_name, file)
        for bucket_name, files in files_res
        for file in files
    ]
