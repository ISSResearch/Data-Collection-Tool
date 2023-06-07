from django.test import TestCase
from attribute.attribute_tests.mock_attribute import MockCase
from file.serializers import FileSerializer, FilesSerializer


class FilesSerializerTest(TestCase):
    def test_files_serializer(self):
        case_data = MockCase()
        case_data2 = MockCase()

        data = FilesSerializer([case_data.file_, case_data2.file_], many=True).data

        self.assertTrue(len(data) == 2)
        self.assertEqual(tuple(data[0].keys()), ('id',))
        self.assertEqual(data[0]['id'], case_data.file_.id)


class FileSerializerTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        FileSerializerTest.case = MockCase()

    def test_file_serializer(self):
        data = FileSerializer(self.case.file_).data

        self.assertEqual(
            set(data.keys()),
            {'id', 'attributes', 'author_name', 'file_name', 'file_type', 'path', 'status', 'upload_date'}
        )
        self.assertEqual(
            {
                val for key, val in data.items()
                if key in {'id', 'file_name', 'file_type', 'status'}
            },
            {
                val for key, val
                in self.case.file_.__dict__.items()
                if key in {'id', 'file_name', 'file_type', 'status'}
            },
        )

    def test_update_file_serializer(self):
        data = FileSerializer(self.case.file_, {'status': 'a',}, partial=True)

        if data.is_valid(): data.update_file()

        updated_data = FileSerializer(self.case.file_).data

        self.assertTrue(updated_data['status'] == 'a')
        self.assertFalse(len(updated_data['attributes']))

    def test_update_attribute_file_serializer(self):
        self.case.attribute2 = self.case.attributegroup.attribute.create(
            name='new_atr',
            project=self.case.project,
            level=self.case.level
        )
        data = FileSerializer(
            self.case.file_,
            {'attribute': {str(self.case.attributegroup.uid): [self.case.attribute2.id]}},
            partial=True
        )

        if data.is_valid(): data.update_file()

        updated_data = FileSerializer(self.case.file_).data

        self.assertTrue(len(updated_data['attributes']) == 1)
        self.assertEqual(
            updated_data['attributes'][0]['attributes'][0][0],
            self.case.attribute2.id,
        )
