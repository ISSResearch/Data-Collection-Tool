from django.test import TestCase
from attribute.attribute_tests.mock_attribute import MockCase
from file.models import File
from user.user_tests.mock_user import MOCK_CLASS


class FileModelTest(TestCase):
    def test_create_file(self):
        user = MOCK_CLASS.create_admin_user()
        case_legit = MockCase()
        new_file = File.objects.create(
            file_name='new_test.png',
            file_type='image',
            path='',
            project=case_legit.project,
            author=user
        )

        self.assertEqual(
            {
                val for key, val in new_file.__dict__.items()
                if key in {'file_name', 'file_type', 'project_id', 'author_id'}
            },
            {'new_test.png', 'image', case_legit.project.id, user.id}
        )
