from django.test import TestCase
from attribute.attribute_tests.mock_attribute import MockCase
from file.services import FileUploader, File
from json import dumps
from attribute.models import AttributeGroup


class FileUploaderTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.base_check = False
        cls.file_data = {
            "name": "blog3",
            "extension": "png",
            "type": "image",
            "atrsGroups": [[]]
        }
        cls.post = type(
            'POST',
            (object,),
            {'getlist': lambda x: [dumps(cls.file_data)]}
        )
        cls.request = type(
            'request',
            (object,),
            {'user': cls.case.user, 'POST': cls.post}
        )

    def setUp(self):
        self.uploader = FileUploader(self.request, self.case.project.id)
        if not self.base_check: self._base_check()

    def test_assing_groups(self):
        res = self.uploader._assign_groups(self.case.file_, 1)
        self.assertEqual(res, [])
        self.assertEqual(self.uploader.groups_taken, 1)

        groups = AttributeGroup.objects.bulk_create(
            {AttributeGroup() for _ in range(3)}
        )
        self.uploader.free_attributegroups = list(groups)
        res_2 = self.uploader._assign_groups(self.case.file_, 2)

        self.assertTrue(all([
            self.case.file_ == group.file
            for group in groups[self.uploader.groups_taken:]
        ]))
        self.assertTrue(self.case.file_ != groups[0].file)

        self.assertEqual(len(res_2), 2)

    def test_form_instances(self):
        ...



    def _base_check(self):
        self.assertEqual(self.uploader.project_id, self.case.project.id)
        self.assertEqual(self.uploader.author_id, self.case.user.id)
        self.assertEqual(self.uploader.files_meta, [self.file_data])

        self.assertEqual(self.uploader.free_attributegroups, list())
        self.assertEqual(self.uploader.new_instances, list())
        self.assertEqual(self.uploader.created_files, list())
        self.assertEqual(self.uploader.groups_taken, 0)

        self.base_check = True
    # def test_file_upload(self):

    #     uploader.proceed_upload()

    #     self.assertTrue(uploader.status)
    #     self.assertTrue(File.objects.count() == 2)
    #     self.assertTrue(len(uploader.created_files) == 1)
