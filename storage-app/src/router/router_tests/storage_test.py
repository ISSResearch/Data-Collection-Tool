from fastapi.testclient import TestClient
from fastapi import FastAPI
from unittest import TestCase
from ..storage import router
from asyncio import new_event_loop, set_event_loop, get_event_loop
from os.path import abspath
from sys import path
from shared.db_manager import (
    DataBase,
    get_db_uri,
    AsyncIOMotorClient,
    AsyncIOMotorGridFSBucket
)


mod_path = abspath(".")
src_pos = mod_path.find("src")
path.append(mod_path[:src_pos+4])


class StorageRouterTest(TestCase):
    bucket_name = "router_bucket"
    db_name = "router_db"

    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        app = FastAPI()
        app.include_router(router)

        DataBase.close_connection()

        try: get_event_loop()
        except RuntimeError: set_event_loop(new_event_loop())

        cls.client = TestClient(app)
        db_client = AsyncIOMotorClient(get_db_uri())

        async def _h():
            fs = AsyncIOMotorGridFSBucket(db_client["db_name"])
            cls.file_id = await fs.upload_from_stream(source=b"1", filename="test_file")

        db_client.get_io_loop().run_until_complete(_h())

    @classmethod
    def tearDownClass(cls) -> None:
        super().tearDownClass()
        DataBase.close_connection()
        cls.client.close()

    def test_get(self):
        no_bucket_no_file_res = self._request("/api/storage/wrong/wrong/")
        bucket_no_file_res = self._request(f"/api/storage/{self.bucket_name}/asd/")
        file_res = self._request(f"/api/storage/{self.bucket_name}/{self.file_id}/")

        self.assertEqual(no_bucket_no_file_res.status_code, 404)
        self.assertEqual(bucket_no_file_res.status_code, 404)
        self.assertEqual(file_res.status_code, 200)

    def _request(self, url, method="get"):
        DataBase.close_connection()
        method_map = { "get": self.client.get, "post": self.client.post }
        return method_map[method](url)
