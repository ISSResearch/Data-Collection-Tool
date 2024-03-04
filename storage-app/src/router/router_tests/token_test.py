from fastapi.testclient import TestClient
from fastapi import FastAPI
from unittest import TestCase
from ..token import router
from jose import jwt
from os.path import abspath
from sys import path
from shared.settings import SECRET_KEY, SECRET_ALGO

mod_path = abspath(".")
src_pos = mod_path.find("src")
path.append(mod_path[:src_pos + 4])


class TokenRouterTest(TestCase):
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

    def test_get(self):
        res = self.client.get("/api/temp_token")

        self.assertTrue(res.status_code, 200)
        self.assertIsInstance(res.json(), str)

        decoded = jwt.decode(res.json(), SECRET_KEY, algorithms=SECRET_ALGO)
        self.assertEqual(
            set(decoded.keys()),
            {"token_type", "exp", "iat", "jti"}
        )
