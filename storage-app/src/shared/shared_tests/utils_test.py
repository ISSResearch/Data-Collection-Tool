from unittest import TestCase
from os import environ
from ..utils import (
    get_db_uri,
    get_path,
    get_object_id,
    emit_token,
    parse_request_for_jwt,
    healthcheck_backend_app
)

class GetDbUriTest(TestCase):
    def setUp(self):
        self.__user = environ.get("DB_USER", "")
        self.__password = environ.get("DB_PASSWORD", "")
        self.__host = environ.get("DB_HOST", "")

        super().setUp()

    def tearDown(self) -> None:
        environ["DB_USER"] = self.__user
        environ["DB_PASSWORD"] = self.__password
        environ["DB_HOST"] = self.__host

        super().tearDown()

    def test(self):
        environ["DB_USER"] = "test_user"
        environ["DB_PASSWORD"] = "test_pass"
        environ["DB_HOST"] = "test_host"

        self.assertEqual(
            get_db_uri(),
            "mongodb://test_user:test_pass@test_host:27017/"
        )
