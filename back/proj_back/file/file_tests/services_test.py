from django.test import TestCase
from attribute.attribute_tests.mock_attribute import MockCase
from user.user_tests.mock_user import MOCK_CLASS
from file.services import FileUploader, upload_chunk, prepare_zip_data, File


# TODO: implement
class PrepareZipData(TestCase): ...


class FileUploaderTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        FileUploaderTest.case = MockCase()
        FileUploaderTest.user = MOCK_CLASS.create_admin_user()

    def test_file_upload(self):
        post = type('POST', (object,), {
            'getlist': lambda x: [
                '{"name":"blog3 copy","extension":"png","type":"image","atrsGroups":[[]]}'
            ]
        })
        request = type('request', (object,), {
            'user': self.user,
            'POST': post
        })

        uploader = FileUploader(request, self.case.project.id)

        uploader.proceed_upload()

        self.assertTrue(uploader.status)
        self.assertTrue(File.objects.count() == 2)
        self.assertTrue(len(uploader.created_files) == 1)
