from unittest import TestCase
from ..app_services import FileMeta, ObjectStreaming, BucketObject, Bucket
from json import dumps


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
    ...


class BucketObjectTest(TestCase):
    ...


class BucketTest(TestCase):
    ...
