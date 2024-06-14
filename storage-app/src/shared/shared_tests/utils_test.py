from unittest import TestCase
from unittest.mock import patch
from bson import ObjectId
from ..settings import SECRET_KEY, SECRET_ALGO
from os import environ, path
from datetime import datetime, timedelta
from jose import jwt, JWTError
import requests
import time
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

        environ["DB_HOST"] = ""
        thrown_error = False
        try: get_db_uri()
        except AttributeError: thrown_error = True
        self.assertTrue(thrown_error)


class GetPathTest(TestCase):
    def test(self):
        cur_path = path.realpath("")
        cur_from = cur_path.split("/")[-1]

        self.assertEqual(get_path(), cur_path)
        self.assertEqual(
            get_path(cur_from),
            "/" + path.join(*cur_path.split("/")[:-1])
        )


class GetObjectIdTest(TestCase):
    def test(self):
        obj_id = str(ObjectId())
        legit_res = get_object_id(obj_id)
        error_test = get_object_id("some")

        self.assertIsInstance(legit_res, ObjectId)
        self.assertIsInstance(error_test, str)

        self.assertEqual(legit_res, ObjectId(obj_id))
        self.assertEqual(error_test, "some")


class EmitTokenTest(TestCase):
    def test(self):
        days_delta = 5
        emited = emit_token(
            {"days": days_delta},
            SECRET_KEY,
            SECRET_ALGO,
            {"some_data": 123}
        )
        decoded = jwt.decode(emited, SECRET_KEY)
        today = datetime.now()

        self.assertEqual(decoded.get("some_data"), 123)
        self.assertEqual(
            datetime.fromtimestamp(decoded.get("exp", 0)).day,
            (today + timedelta(days=days_delta)).day
        )


class ParseForJWTTest(TestCase):
    def test(self):
        emited = emit_token({"days": 1}, SECRET_KEY, SECRET_ALGO, {"some": 123})
        request = lambda token, query=0, _type="Bearer ": type(
            "request",
            (object,),
            {
                "headers": {
                    "authorization": _type + token
                },
                "query_params": {
                    "access": token if query else None
                }
            }
        )

        self._helper(request(emited))
        self._helper(request(emited, query=1))
        self._helper(request(emited, _type="wrong "), False)
        self._helper(request(emited, _type="wrong"), False)
        self._helper(request("asd"), False)
        self._helper(request("asd", query=1), False)
        self._helper(request(""), False)
        self._helper(request("", query=1), False)

    def _helper(self, request, valid=True):
        if valid:
            res = parse_request_for_jwt(request)
            self.assertIsInstance(res, dict)
            self.assertEqual(res.get("some"), 123)
        else:
            try:
                parse_request_for_jwt(request)
                self.assertFalse(True)
            except JWTError: self.assertTrue(True)


class HealthCheckTest(TestCase):
    _no_status = lambda *ar, **kw: HealthCheckTest._rq(404)
    _no_data = lambda *ar, **kw: HealthCheckTest._rq(200)
    _no_connection = lambda *ar, **kw: HealthCheckTest._rq(500)
    _valid = lambda *ar, **kw: HealthCheckTest._rq(200, {"isAuth": True})

    def test(self):
        @patch("time.sleep", side_effect=lambda x: ...)
        @patch("requests.get", side_effect=self._no_status)
        def _test_no_status(*args): return healthcheck_backend_app()
        self.assertFalse(_test_no_status())

        @patch("time.sleep", side_effect=lambda x: ...)
        @patch("requests.get", side_effect=self._no_data)
        def _test_no_data(*args): return healthcheck_backend_app()
        self.assertFalse(_test_no_data())

        @patch("time.sleep", side_effect=lambda x: ...)
        @patch("requests.get", side_effect=self._no_connection)
        def _test_no_connection(*args): return healthcheck_backend_app()
        self.assertFalse(_test_no_connection())

        @patch("time.sleep", side_effect=lambda x: ...)
        @patch("requests.get", side_effect=self._valid)
        def _test_valid(*args): return healthcheck_backend_app()
        self.assertTrue(_test_valid())

    @staticmethod
    def _rq(status, data={}):
        if status == 500: raise requests.ConnectionError

        return type(
            "requests",
            (object,),
            {"status_code": status, "json": lambda: data}
        )
