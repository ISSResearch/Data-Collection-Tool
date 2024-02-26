from unittest import TestCase
from re import Match
from ..app_services import FileMeta, ObjectStreaming, BucketObject, Bucket
from ..utils import get_db_uri
from json import dumps
from motor.motor_asyncio import AsyncIOMotorClient


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
        cls.file = lambda _, m=dict(), f=b"": type(
            "file",
            (object, ),
            {
                "metadata": m,
                "file": f,
                "length": len(f),
                "read": lambda _: ...,
                "seek": lambda _: ...,
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

        meta["file_extension"] = "";
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

        async def _helper():
            async for c in stream._iterator(): print(c)

        run(_helper())

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


class BucketObjectTest(TestCase):
    @classmethod
    def setUpClass(cls): cls.client = AsyncIOMotorClient(get_db_uri())

    @classmethod
    def tearDownClass(cls): cls.client.close()

    def test_delete(self):
        async def _h(): print(123)
        run(self.client, _h)
    # def test_put(self): ...
    # def test_create(self): ...
    # def test_set_has(self): ...

class BucketTest(TestCase):
    def setUp(self): ...
    def tearDown(self): ...
    def test_get_downloads(self): ...
    def test_get(self): ...


def run(client, f):
    async def _h():
        session = await client.start_session()
        async with session.start_transaction() as transaction:
            await f()
            await session.abort_transaction()

    client.get_io_loop().run_until_complete(_h())
