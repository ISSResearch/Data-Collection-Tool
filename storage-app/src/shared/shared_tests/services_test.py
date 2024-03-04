from unittest import TestCase
from re import Match
from ..app_services import FileMeta, ObjectStreaming, BucketObject, Bucket
from ..db_manager import DataBase, get_db_uri
from ..settings import CHUNK_SIZE
from json import dumps
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from bson import ObjectId
from asyncio import run as aiorun
from random import randbytes
from asyncio import new_event_loop, set_event_loop, get_event_loop


def run(client, f):
    async def _h():
        session = await client.start_session()
        async with session.start_transaction() as _:
            await f()
            await session.abort_transaction()

    client.get_io_loop().run_until_complete(_h())


class FileMetaTest(TestCase):
    defaults = {
        'file_extension': None,
        'file_name': None,
        'file_type': None
    }

    def test_meta(self):
        payload = {"some": 123}
        meta = FileMeta(dumps(payload))
        meta_2 = FileMeta(dumps({"file_name": "name"}))

        self.assertIsNone(meta._prepared_meta)
        self.assertEqual(dumps(payload), meta._meta)

        self.assertEqual(meta.prepared_meta, payload)
        self.assertEqual(meta._prepared_meta, payload)

        self.assertEqual(meta.get(), self.defaults)
        self.assertEqual(meta_2.get(), {**self.defaults, "file_name": "name"})


class ObjectStreamingTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        DataBase.close_connection()
        try: get_event_loop()
        except RuntimeError: set_event_loop(new_event_loop())
        async def _r(size): return bytes(size)
        cls.file = lambda _, m=dict(), f=b"": type(
            "file",
            (object, ),
            {
                "metadata": m,
                "file": f,
                "length": len(f),
                "read": _r,
                "seek": lambda _: ...,
                "close": lambda: ...,
                "filename": "name"
            }
        )
        cls.request = lambda _, r="", a=0: type(
            "request",
            (object, ),
            {"headers": {"range": r}, "query_params": {"archive": str(a)}}
        )

    def test_type(self):
        meta = {"file_type": "type", "file_extension": "ext"}

        self.assertEqual(
            ObjectStreaming(self.file()).content_type,
            "application/octet-stream"
        )
        self.assertEqual(
            ObjectStreaming(self.file(meta)).content_type,
            "type/ext"
        )

        meta["file_extension"] = ""
        self.assertEqual(
            ObjectStreaming(self.file(meta)).content_type,
            "application/octet-stream"
        )

    def test_range(self):
        stream = ObjectStreaming(self.file())
        self.assertIsNone(stream._get_range_match(self.request()))
        self.assertIsNone(stream._get_range_match(self.request("asd=0-")))
        self.assertIsInstance(
            stream._get_range_match(self.request("bytes=0-")),
            Match
        )

    def test_chunks(self):
        stream = ObjectStreaming(self.file({}, b"123"))
        self.assertEqual(stream.chunk_start, 0)
        self.assertEqual(stream.chunk_end, 2)
        self.assertEqual(stream.chunk_length, 3)

        stream.range_match = stream._get_range_match(self.request("bytes=1-2"))
        stream._set_chunks()
        self.assertEqual(stream.chunk_start, 1)
        self.assertEqual(stream.chunk_end, 2)
        self.assertEqual(stream.chunk_length, 2)

    def test_iterator(self):
        stream = ObjectStreaming(self.file({}, b"12345"))

        async def _h():
            async for chunk in stream._iterator():
                self.assertEqual(chunk, bytes(CHUNK_SIZE))

        aiorun(_h())

    def test_dataset(self, stream=None):
        if not stream: stream = ObjectStreaming(self.file())._stream_dataset()
        self.assertEqual(
            stream.headers.get("Content-Disposition"),
            "attachment; filename=name.zip"
        )
        self.assertIsNone(stream.headers.get("Accept-Ranges"))
        self.assertIsNone(stream.headers.get("Content-Range"))

    def test_filestream(self, stream=None):
        if not stream: stream = ObjectStreaming(self.file())._stream_file(self.request())
        self.assertEqual(stream.headers.get("Accept-Ranges"), "bytes")
        self.assertEqual(stream.headers.get("Content-Range"), "bytes 0--1/0")
        self.assertIsNone(stream.headers.get("Content-Disposition"))

    def test_stream(self):
        self.test_dataset(ObjectStreaming(self.file()).stream(self.request("", 1)))
        self.test_filestream(ObjectStreaming(self.file()).stream(self.request("", 0)))


class BucketTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        DataBase.close_connection()
        try: get_event_loop()
        except RuntimeError: set_event_loop(new_event_loop())
        cls.client = AsyncIOMotorClient(get_db_uri())

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()

        async def _h():
            fs = AsyncIOMotorGridFSBucket(cls.client.test_storage)
            async for f in fs.find({}): await fs.delete(f._id)
        run(cls.client, _h)

        cls.client.get_io_loop().close()
        cls.client.close()
        DataBase.close_connection()

    def test_delete(self):
        async def _h():
            fs = AsyncIOMotorGridFSBucket(self.client.test_storage)
            bucket = BucketObject(fs)

            f_id = await fs.upload_from_stream(source=b"1", filename="test_file")

            self.assertIsInstance(f_id, ObjectId)
            self.assertIsNotNone(await fs.find({"_id": f_id}).next())

            res, message = await bucket.delete_object(f_id)

            self.assertTrue(res)
            self.assertEqual(message, "")

            try:
                await fs.find({"_id": f_id}).next()
                self.assertTrue(False)
            except Exception: self.assertTrue(True)

            res, message = await bucket.delete_object(f_id)
            self.assertFalse(res)
            self.assertEqual(message, "no such file")

        run(self.client, _h)

    def test_put(self):
        async def _r(): return b"234"

        async def _h():
            file_meta = {"file_name": "test_file", "file_extension": "png", "file_type": "image"}
            fs = AsyncIOMotorGridFSBucket(self.client.test_storage)
            bucket = BucketObject(fs)
            f_id, status = await bucket.put_object(
                type("file", (object, ), {"read": _r}),
                dumps(file_meta)
            )

            file = await fs.find({"_id": ObjectId(f_id)}).next()

            self.assertEqual(status, 201)
            self.assertIsInstance(f_id, str)
            self.assertEqual(file.length, 3)
            self.assertEqual(file.filename, file_meta["file_name"])
            self.assertEqual(file.metadata["file_extension"], file_meta["file_extension"])
            self.assertEqual(file.metadata["file_type"], file_meta["file_type"])
            self.assertIsNotNone(file.metadata["hash"])

            f_id, status = await bucket.put_object(
                type("file", (object, ), {"read": _r}),
                dumps(file_meta)
            )
            self.assertEqual(status, 400)
            self.assertEqual("Such file already exists", f_id)

        run(self.client, _h)

    def test_set_hash(self):
        async def _r(b=b"3"): return b

        async def _h():
            fs = AsyncIOMotorGridFSBucket(self.client.test_storage)
            bucket = BucketObject(fs)

            await bucket.put_object(
                type("file", (object, ), {"read": _r}),
                dumps({"file_name": "test_file", "file_extension": "png", "file_type": "image"})
            )

            test_meta = {"source": b"4", "metadata": {}}
            self.assertIsNone(test_meta.get("hash"))

            await bucket._set_hash(test_meta)
            self.assertIsNotNone(test_meta["metadata"].get("hash"))

            try: await bucket._set_hash({"source": b"3"})
            except AssertionError: return

            self.assertFalse(True)

        run(self.client, _h)

    def test_get_object(self):
        async def _r(): return randbytes(10)

        async def _h():
            bucket = Bucket("test_storage")

            f_id, _ = await bucket.put_object(
                type("file", (object, ), {"read": _r}),
                dumps({"file_name": "test_file", "file_extension": "png", "file_type": "image"})
            )

            self.assertIsNone(await bucket.get_object("some"))
            self.assertIsInstance(await bucket.get_object(f_id), ObjectStreaming)

        run(self.client, _h)

    def test_get_downloads(self):
        async def _r(): return randbytes(10)

        async def _h():
            bucket = Bucket("test_storage")

            f_id, _ = await bucket.put_object(
                type("file", (object, ), {"read": _r}),
                dumps({"file_name": "test_file", "file_extension": "png", "file_type": "image"})
            )

            self.assertEqual(
                len([file async for file in bucket.get_download_objects([f_id])]),
                1
            )

        run(self.client, _h)
