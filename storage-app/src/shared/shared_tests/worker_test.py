from unittest import TestCase
from unittest.mock import patch
from ..worker_services import Zipper
from ..db_manager import DataBase, get_db_uri
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
from asyncio import run as aiorun
from os.path import exists
from asyncio import get_event_loop, new_event_loop, set_event_loop

BUCKET = "test_bucket"


def run(client, f):
    async def _h():
        session = await client.start_session()
        async with session.start_transaction() as _:
            await f()
            await session.abort_transaction()

    client.get_io_loop().run_until_complete(_h())


class ZipperTest(TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        super().setUpClass()
        DataBase.close_connection()
        try: get_event_loop()
        except RuntimeError: set_event_loop(new_event_loop())
        cls.client = AsyncIOMotorClient(get_db_uri())

    @classmethod
    def tearDownClass(cls) -> None:
        super().tearDownClass()
        cls.client.close()
        DataBase.close_connection()

    def test_init(self):
        zipper = self._get_zipper()

        self.assertEqual(zipper.bucket_name, "test_bucket")
        self.assertEqual(zipper.archive, "")
        self.assertEqual(zipper.annotated, 1)
        self.assertEqual(zipper.annotation, {"some": 123})
        self.assertIsNone(zipper.archive_id)

    def test_archive(self):
        zipper = self._get_zipper()
        zipper.annotated = 0
        zipper.written = True

        async def _h():
            self.assertIsNone(await zipper.archive_objects())
            zipper.annotated = 1
            self.assertIsNone(await zipper.archive_objects())
            zipper.written = False
            self.assertEqual(zipper.archive, "")
            self.assertTrue(await zipper.archive_objects())
            self.assertTrue(zipper.written)
            self.assertRegex(zipper.archive, r'\./temp_zip/([a-zA-Z0-9]+)\.zip')
            self.assertTrue(exists(zipper.archive))
            self.assertIsNone(zipper.archive_id)

        run(self.client, _h)

    def test_write(self):
        zipper = self._get_zipper()
        async def _h():
            self.assertTrue(await zipper.archive_objects())
            self.assertTrue(exists(zipper.archive))

            await zipper.write_archive()
            self.assertIsInstance(zipper.archive_id, str)

            bucket = DataBase.get_fs_bucket("temp_storage")
            cur = bucket.find({"_id": ObjectId(zipper.archive_id)})
            item = await cur.next()
            self._test_object_name(zipper, item)
            self.assertEqual(item.filename, f"{BUCKET}_dataset")

        run(self.client, _h)

    def test_delete(self):
        zipper = self._get_zipper()
        async def _h():
            self.assertTrue(await zipper.archive_objects())
            self.assertTrue(exists(zipper.archive))
            zipper.delete_temp_zip()
            self.assertFalse(exists(zipper.archive))

        run(self.client, _h)

    def _test_object_name(self, zipper, obj):
        name = zipper._get_object_name(obj)

    @staticmethod
    @patch(
        "requests.post",
        side_effect=lambda *a, **k: type(
            "requests",
            (object,),
            {
                "status_code": 202,
                "json": lambda: {"annotated": 1, "annotation": {"some": 123}}
            }
        )
    )
    def _get_zipper(mock): return Zipper(BUCKET, ["some"])
