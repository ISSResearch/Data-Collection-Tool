from fastapi.testclient import TestClient
from fastapi import FastAPI
from unittest import TestCase
from ..task import router
from os.path import abspath
from sys import path
from shared.db_manager import DataBase
from json import dumps
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
        task = cls.client.post(
            "/api/task/archive/",
            json={
                "bucket_name": "test",
                "file_ids": []
            },
            headers={"Content-Type": "application/json"}
        )
        cls.check_id = task.json()["task_id"]

    @classmethod
    def tearDownClass(cls) -> None:
        super().tearDownClass()
        cls.client.close()

    def test_produce(self):
        invalid_res = self.client.post(
            "/api/task/archive/",
            json={},
            headers={"Content-Type": "application/json"}
        )
        res = self.client.post(
            "/api/task/archive/",
            json={
                "bucket_name": "test",
                "file_ids": ["asd", "zxc"]
            },
            headers={"Content-Type": "application/json"}
        )
        self.assertEqual(invalid_res.status_code, 422)
        self.assertEqual(res.status_code, 201)

        task_id = res.json().get("task_id")
        self.assertIsNotNone(task_id)
        self.assertIsInstance(task_id, str)

    def test_check(self):
        pending_res = self.client.get("/api/task/asdasd/")
        res = self.client.get(f"/api/task/{self.check_id}/")

        self.assertTrue(res.status_code == pending_res.status_code == 200)
        self.assertTrue(pending_res.json()["status"], "PENDING")
        self.assertTrue(res.json()["status"], "SUCCESS")
