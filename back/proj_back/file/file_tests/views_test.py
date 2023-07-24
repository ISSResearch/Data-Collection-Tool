from django.test import TestCase
from user.user_tests.mock_user import MOCK_CLASS
from attribute.attribute_tests.mock_attribute import MockCase
from file.models import File


class FileViewSetTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        FileViewSetTest.case = MockCase()
        FileViewSetTest.user = MOCK_CLASS.create_admin_user()

    def test_update_file(self):
        self.client.force_login(self.user)

        self.case.attribute2 = self.case.attributegroup.attribute.create(
            name='new_atr',
            project=self.case.project,
            level=self.case.level
        )

        request_data = {
            'status': 'a',
            'attribute': {str(self.case.attributegroup.uid): [self.case.attribute2.id]}
        }

        request = self.client.patch(
            f'/api/files/{self.case.file_.id}/',
            data=request_data,
            content_type='application/json'
        )

        self.assertTrue(request.status_code == 202)
        self.assertTrue(request.data['ok'])

    def test_delete_file(self):
        self.client.force_login(self.user)
        request = self.client.delete(f'/api/files/{self.case.file_.id}/')

        self.assertTrue(request.status_code == 202)
        self.assertFalse(len(File.objects.filter(id=self.case.file_.id)))


class FilesViewSetTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        FilesViewSetTest.case = MockCase()
        FilesViewSetTest.user = MOCK_CLASS.create_admin_user()

    def test_get_files(self):
        self.client.force_login(self.user)

        self.case.file_2 = File.objects.create(
            file_name='f_name2',
            project=self.case.project,
            author_id=self.user.id
        )

        request = self.client.get(f'/api/files/project/{self.case.project.id}/')

        self.assertTrue(request.status_code == 200)
        self.assertTrue(len(request.data) == 2)
        self.assertEqual(
            set(request.data[0].keys()),
            {'id', 'attributes', 'author_name', 'file_name', 'file_type', 'path', 'status', 'upload_date'}
        )
        self.assertEqual(
            {
                val for key, val in request.data[0].items()
                if key in {'id', 'file_name', 'file_type', 'status'}
            },
            {
                val for key, val
                in self.case.file_2.__dict__.items()
                if key in {'id', 'file_name', 'file_type', 'status'}
            },
        )

    def test_post_files(self):
        self.client.force_login(self.user)

        request = '{"name":"blog3 copy","extension":"png","type":"image","atrsGroups":[[]]}'

        response = self.client.post(
            f'/api/files/project/{self.case.project.id}/',
            data={'meta[]': [request]},
        )

        self.assertTrue(response.status_code == 201, response.status_code)
        self.assertTrue(response.data['ok'])
        self.assertTrue(len(response.data['created_files']) == 1, response.data)


class ProjectStatsTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        ProjectStatsTest.case = MockCase()
        ProjectStatsTest.user = MOCK_CLASS.create_admin_user()

    def test_get_project_stats(self):
        self.client.force_login(self.user)

        request = self.client.get(f'/api/files/stats/project/{self.case.project.id}/')

        self.assertTrue(request.status_code == 200)
        self.assertTrue(len(request.data) == 1)
        self.assertEqual(
            {key for key in request.data[0]},
            {'attribute__id', 'name', 'order', 'attribute__attributegroup__file__file_type', 'attribute__attributegroup__file__status' ,'attribute__name', 'attribute__parent', 'count'}
        )
        self.assertEqual(
            {val for val in request.data[0].values()},
            {self.case.level.name, self.case.level.order, self.case.attribute.id, self.case.attribute.name, self.case.attribute.parent, 1, self.case.file_.file_type, self.case.file_.status},
        )

    def test_get_unexisted_project_stats(self):
        self.client.force_login(self.user)
        request = self.client.get(f'/api/files/stats/project/asd/')

        self.assertTrue(request.status_code == 404)