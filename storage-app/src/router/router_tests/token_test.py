from fastapi.testclient import TestClient
from fastapi import FastAPI
from unittest import TestCase
from ..token import router
from asyncio import new_event_loop, set_event_loop, get_event_loop
from shared.db_manager import DataBase
from os.path import abspath
from sys import path

mod_path = abspath(".")
src_pos = mod_path.find("src")
path.append(mod_path[:src_pos+4])


class TokenRouterTest(TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        app = FastAPI()
        app.include_router(router)

        DataBase.close_connection()

        try: get_event_loop()
        except RuntimeError: set_event_loop(new_event_loop())

        cls.client = TestClient(app)

    @classmethod
    def tearDownClass(cls) -> None:
        super().tearDownClass()
        DataBase.close_connection()
        cls.client.close()
