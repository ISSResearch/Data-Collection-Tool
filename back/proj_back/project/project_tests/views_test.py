from django.test import TestCase
from .mock_project import MOCK_PROJECT
from project.models import Project
from user.user_tests.mock_user import MOCK_CLASS


class ProjectsViewSetTest(TestCase, MOCK_PROJECT):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        ProjectsViewSetTest.user = MOCK_CLASS.create_admin_user()

    def test_unlogged_requests(self):
        self.client.logout()
        get_request = self.client.get(self.endpoint)
        post_request = self.client.post(self.endpoint)

        self.assertTrue(get_request.status_code == 403)
        self.assertTrue(post_request.status_code == 403)

    def test_get_projects(self):
        self.client.force_login(self.user)

        projects = Project.objects.bulk_create(
            Project(
                name=self.data['name'] + str(index),
                description=self.data['description'] + str(index)
            )
            for index in range(5)
        )
        projects[-1].visible = False
        projects[-1].save()

        response = self.client.get(self.endpoint)

        self.assertTrue(response.status_code == 200)
        self.assertTrue(len(response.data) == 4)
        self.assertTrue(all([
            bool(projects[0].name == self.data['name'] + '0'),
            bool(projects[0].description == self.data['description'] + '0')
        ]))

        self.user.is_superuser = False
        self.user.save()

        response = self.client.get(self.endpoint)

        self.assertFalse(response.data)

        projects[0].user_visible.add(self.user.id)

        response = self.client.get(self.endpoint)

        self.assertEqual(response.data[0]['id'], projects[0].id)

    def test_create_project(self):
        self.client.force_login(self.user)

        request = self.client.post(self.endpoint, self.data, content_type='application/json')

        self.assertTrue(request.status_code == 201)
        self.assertTrue(request.data['ok'])


class ProjectViewSetTest(TestCase, MOCK_PROJECT):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        ProjectViewSetTest.user = MOCK_CLASS.create_admin_user()
        ProjectViewSetTest.project = Project.objects.create(
            name=cls.data['name'],
            description=cls.data['description']
        )
        for form in cls.data['attributes']: cls.project.add_attributes(form)

    def test_unlogged_requests(self):
        self.client.logout()
        get_request = self.client.get(self.endpoint)
        update_request = self.client.post(self.endpoint)
        delete_request = self.client.post(self.endpoint)

        self.assertTrue(get_request.status_code == 403)
        self.assertTrue(update_request.status_code == 403)
        self.assertTrue(delete_request.status_code == 403)

    def test_get_project(self):
        self.client.force_login(self.user)

        request = self.client.get(f'{self.endpoint}{self.project.id}/')

        self.assertTrue(request.status_code == 200)
        self.assertTrue(request.data['name'] == self.project.name)
        self.assertTrue(request.data['description'] == self.project.description)
        self.assertEqual(
            {level['name'] for level in request.data['attributes'] if not level['parent']},
            {form['levels'][0]['name'] for form in self.data['attributes']}
        )

        self.user.is_superuser = False
        self.user.save()

        request = self.client.get(f'{self.endpoint}{self.project.id}/')

        self.assertTrue(request.status_code == 403)

        self.project.user_visible.add(self.user.id)

        request = self.client.get(f'{self.endpoint}{self.project.id}/')

        self.assertTrue(request.status_code == 200)
        self.assertTrue(request.data['name'] == self.project.name)

    def test_get_invalid_project(self):
        self.client.force_login(self.user)

        self.project.visible = False
        self.project.reason_if_hidden = 'd'
        self.project.save()

        unexisted_project_request = self.client.get(f'{self.endpoint}1238971/')

        hidden_project_request = self.client.get(f'{self.endpoint}{self.project.id}/')

        self.assertTrue(unexisted_project_request.status_code == 404)
        self.assertTrue(unexisted_project_request.data == 'query project does not exist')
        self.assertTrue(hidden_project_request.status_code == 404)
        self.assertTrue(hidden_project_request.data == 'query project does not exist')

    def test_update_project(self):
        self.client.force_login(self.user)

        request_attributes = self.data['attributes']
        request_attributes[1]['levels'][0]['name'] = 'newtestname'
        request_attributes[1]['levels'][0]['multiple'] = True
        request_attributes[1]['levels'][0]['required'] = True
        request = {
            'name': 'TestUpdateName',
            'description': 'TestUpdateDesctiption',
            'attributes': request_attributes
        }

        request = self.client.patch(
            f'{self.endpoint}{self.project.id}/',
            request,
            content_type='application/json'
        )

        updated_project = Project.objects.get(id=self.project.id)

        self.assertTrue(request.status_code == 202)
        self.assertTrue(request.data['ok'])
        self.assertEqual(updated_project.name, 'TestUpdateName')
        self.assertEqual(updated_project.description, 'TestUpdateDesctiption')
        self.assertEqual(updated_project.level_set.last().name, 'newtestname')
        self.assertTrue(updated_project.level_set.last().name)
        self.assertTrue(updated_project.level_set.last().name)

    def test_approved_delete_project(self):
        self.client.force_login(self.user)

        self.project.visible = True
        self.project.reason_if_hidden = ''
        self.project.save()

        request = self.client.delete(
            f'{self.endpoint}{self.project.id}/',
            {'approval': self.project.name},
            content_type='application/json'
        )

        updated_project = Project.objects.get(id=self.project.id)
        self.assertTrue(request.status_code == 200)
        self.assertFalse(updated_project.visible)
        self.assertTrue(updated_project.reason_if_hidden == 'd')

    def test_unapproved_delete_project(self):
        self.client.force_login(self.user)

        self.project.visible = True
        self.project.reason_if_hidden = ''
        self.project.save()

        existed_project_request = self.client.delete(
            f'{self.endpoint}{self.project.id}/',
            {'approval': 'wrong approve'},
            content_type='application/json'
        )

        unexisted_project_request = self.client.delete(
            f'{self.endpoint}19823/',
            {'approval': 'wrong approve'},
            content_type='application/json'
        )

        updated_project = Project.objects.get(id=self.project.id)
        self.assertTrue(existed_project_request.status_code == 400)
        self.assertTrue(unexisted_project_request.status_code == 404)
        self.assertTrue(existed_project_request.data == 'approval text differs from the actual name')
        self.assertTrue(unexisted_project_request.data == 'query project does not exist')
        self.assertTrue(updated_project.visible)
        self.assertFalse(updated_project.reason_if_hidden == 'd')


class CollectorViewTest(TestCase, MOCK_PROJECT):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        CollectorViewTest.user = MOCK_CLASS.create_admin_user()
        CollectorViewTest.project = Project.objects.create(
            name=cls.data['name'],
            description=cls.data['description'],
        )

    def test_get_collectors(self):
        self.user.is_superuser = False
        self.user.save()

        self.project.user_visible.add(self.user.id)
        self.project.user_edit.add(self.user.id)

        self.client.force_login(self.user)
        request = self.client.get(f'{MOCK_CLASS.collector_endpoint}{self.project.id}/')

        self.assertEqual(request.status_code, 200)
        self.assertEqual(
            set(request.data[0].keys()),
            {'id', 'username', 'permissions'},
        )

    def test_patch_collectors(self):
        self.user.is_superuser = False
        self.user.save()
        self.project.user_edit.add(self.user.id)

        self.client.force_login(self.user)
        request = self.client.patch(
            f'{MOCK_CLASS.collector_endpoint}{self.project.id}/',
            {
                'users': [
                    {
                        'user_id': self.user.id,
                        'permissions': {
                            'view': True,
                            'upload': False,
                            'validate': True,
                            'stats': False,
                            'download': True,
                            'edit': False
                        }
                    }
                ]
            },
            content_type='application/json'
        )

        self.assertEqual(request.status_code, 200)
        self.assertEqual(request.data[0]['id'], self.user.id)
        self.assertEqual(
            request.data[0]['permissions'],
            {'view': True, 'upload': False, 'validate': True, 'stats': False, 'download': True, 'edit': False}
        )
