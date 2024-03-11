from fastapi.testclient import TestClient
from random import randbytes
from json import dumps
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
path.append(mod_path[:src_pos + 4])


class StorageRouterTest(TestCase):
    bucket_name = "router_bucket"
    db_name = "storage"

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
            fs = AsyncIOMotorGridFSBucket(
                db_client[cls.db_name],
                bucket_name=cls.bucket_name
            )
            cls.file_id = await fs.upload_from_stream(
                source=b"asd",
                filename="test_file",
                metadata={"file_type": "image"}
            )
            cls.delete_id = await fs.upload_from_stream(
                source=b"zxc",
                filename="test_file",
                metadata={"file_type": "image"}
            )

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
        self.assertEqual(file_res.status_code, 206)
        self.assertEqual(b"asd", file_res.read())

    def test_delete(self):
        invalid_res = self._request(
            f"/api/storage/{self.bucket_name}/asd/",
            "delete"
        )
        valid_res = self._request(
            f"/api/storage/{self.bucket_name}/{self.delete_id}/",
            "delete"
        )

        self.assertEqual(invalid_res.status_code, 404)
        self.assertEqual(valid_res.status_code, 200)
        self.assertFalse(invalid_res.json()["ok"])
        self.assertTrue(valid_res.json()["ok"])
        self.assertEqual(invalid_res.json()["result"], "no such file")
        self.assertEqual(valid_res.json()["result"], "")

    def test_post(self):
        test_file = randbytes(10)
        invalid_res = self._request(
            f"/api/storage/{self.bucket_name}/",
            "post",
            {"file": test_file}
        )
        res = self._request(
            f"/api/storage/{self.bucket_name}/",
            "post",
            {
                "file": test_file,
                "data": {
                    "file_meta": dumps({
                        "file_name": "name",
                        "file_type": "type",
                        "file_extension": "ext"
                    })
                }
            }
        )
        same_file_res = self._request(
            f"/api/storage/{self.bucket_name}/",
            "post",
            {
                "file": test_file,
                "data": {
                    "file_meta": dumps({
                        "file_name": "name",
                        "file_type": "type",
                        "file_extension": "ext"
                    })
                }
            }
        )
        self.assertEqual(invalid_res.status_code, 422)
        self.assertEqual(res.status_code, 201)
        self.assertIsNotNone(res.json().get("result"))
        self.assertEqual(same_file_res.status_code, 400)
        self.assertEqual(same_file_res.json()["result"], "Such file already exists")

    def _request(self, url, method="get", data={}):
        DataBase.close_connection()
        method_map = {
            "get": self.client.get,
            "post": self.client.post,
            "delete": self.client.delete
        }

        payload = {"url": url}
        if data:
            data, file = data.get("data"), data.get("file")
            if data: payload["data"] = data
            if file: payload["files"] = {"file": file}

        return method_map[method](**payload)
