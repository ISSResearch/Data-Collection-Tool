from ..db_manager import DataBase
from ..utils import get_db_uri
from unittest import TestCase
from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorDatabase,
    AsyncIOMotorGridFSBucket
)


class DBTest(TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        cls.uri = get_db_uri()

    def setUp(self):
        self.assertIsNone(DataBase._DataBase__client)
        self.assertIsNone(DataBase._DataBase__current_db)

    def tearDown(self) -> None:
        DataBase._DataBase__client = None
        DataBase._DataBase__current_db = None

    def test_connect(self):
        DataBase.set_client(self.uri)
        self.assertIsInstance(DataBase._DataBase__client, AsyncIOMotorClient)

    def test_db(self):
        DataBase.set_client(self.uri)
        DataBase.set_db("test_db")

        self.assertIsInstance(DataBase._DataBase__current_db, AsyncIOMotorDatabase)
        self.assertEqual(DataBase._DataBase__current_db.name, "test_db")

    def test_bucket(self):
        DataBase.set_client(self.uri)
        DataBase.set_db("test_db")

        bucket = DataBase.get_fs_bucket("test_bucket")
        self.assertIsInstance(bucket, AsyncIOMotorGridFSBucket)
