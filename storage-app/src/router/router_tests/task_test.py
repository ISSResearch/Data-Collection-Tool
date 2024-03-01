from fastapi.testclient import TestClient
from fastapi import FastAPI
from unittest import TestCase
from ..task import router
from os.path import abspath
from sys import path
from shared.db_manager import DataBase
from asyncio import new_event_loop, set_event_loop, get_event_loop

mod_path = abspath(".")
src_pos = mod_path.find("src")
path.append(mod_path[:src_pos+4])


class TaskRouterTest(TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        app = FastAPI()
        app.include_router(router)
        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        super().tearDownClass()
        cls.client.close()

    def test_produce(self):
        res = self.client.post(
            "/api/task/archive/",
            json={
                "bucket_name": "test",
                "file_ids": ["asd", "zxc"]
            },
            headers={"Content-Type": "multipart/form-data"}
        )
        print(res.json())

    def test_check(self):
        res = self.client.get("/api/task/asdasd")
        print(res.json())
