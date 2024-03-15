from django.test import TestCase
from attribute.attribute_tests.mock_attribute import case_set_up
from file.serializers import FileSerializer, FilesSerializer


class FilesSerializerTest(TestCase):
    def test_files_serializer(self):
        case_data, case_data2 = case_set_up()

        data = FilesSerializer([case_data.file_, case_data2.file_], many=True).data

        self.assertTrue(len(data) == 2)
        self.assertEqual(tuple(data[0].keys()), ('id',))
        self.assertEqual(data[0]['id'], case_data.file_.id)


class FileSerializerTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case, _ = case_set_up()

    def test_file_serializer(self):
        data = FileSerializer(self.case.file_).data
        data_keys = {
            'id',
            'file_name',
            'file_type',
            'status',
            'is_downloaded',
        }

        self.assertEqual(
            set(data.keys()),
            data_keys.union({
                'upload_date',
                "update_date",
                'attributes',
                'author_name',
                "validator_name"
            })
        )
        self.assertEqual(
            {val for key, val in data.items() if key in data_keys},
            {val for key, val in self.case.file_.__dict__.items() if key in data_keys},
        )
        self.assertEqual(data["author_name"], self.case.user.username)
        self.assertEqual(data["attributes"][0].keys(), {"uid", "attributes"})

    def test_update_file_serializer(self):
        data = FileSerializer(
            self.case.file_,
            {'status': 'a'},
            partial=True,
            context={"validator": self.case.user}
        )
        init_date = data.instance.upload_date

        self.assertIsNone(data.instance.validator)

        if data.is_valid(): data.update_file()

        updated_data = FileSerializer(self.case.file_).data

        self.assertEqual(updated_data['status'], 'a')
        self.assertFalse(bool(updated_data['attributes']))
        self.assertIsNotNone(updated_data.get("validator_name"))
        self.assertNotEqual(updated_data.get("update_date"), init_date)

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

        self.assertEqual(len(updated_data['attributes']), 1)
        self.assertEqual(
            updated_data['attributes'][0]['attributes'][0][0],
            self.case.attribute2.id,
        )
