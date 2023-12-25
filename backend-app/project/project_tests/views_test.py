from django.test import TestCase
from .mock_project import MOCK_PROJECT
from project.models import Project
from user.models import CustomUser


class ProjectsViewSetTest(TestCase, MOCK_PROJECT):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.projects = Project.objects.bulk_create([
            Project(name=f"name_{i}", visible=bool(i))
            for i in range(3)
        ])
        cls.users = CustomUser.objects.bulk_create([
            CustomUser(
                username=f"name_{i}",
                password="pass",
                is_superuser=not i
            )
            for i in range(3)
        ])
        cls.projects[-1].user_visible.add(cls.users[-1].id)

    def test_invalid_request(self):
        init_count = Project.objects.count()

        token = self.users[0].emit_token()

        get_request = self.client.get(
            self.endpoint,
            HTTP_AUTHORIZATION="Bearer zxc"
        )
        post_invalid = self.client.post(
            self.endpoint,
            HTTP_AUTHORIZATION="Bearer asd"
        )
        post_valid = self.client.post(
            self.endpoint,
            HTTP_AUTHORIZATION="Bearer " + token
        )

        self.assertEqual(get_request.status_code, 403)
        self.assertEqual(post_invalid.status_code, 403)
        self.assertEqual(post_valid.status_code, 400)
        self.assertIsNotNone(post_valid.data["errors"])
        self.assertEqual(init_count, Project.objects.count())

    def test_get_projects(self):
        for count, user in zip((2, 0, 1), self.users):
            token = user.emit_token()

            result = self.client.get(
                self.endpoint,
                HTTP_AUTHORIZATION="Bearer " + token
            )

            self.assertEqual(result.status_code, 200)
            self.assertEqual(len(result.data), count)

    def test_create_project(self):
        init_count = Project.objects.count()
        token = self.users[0].emit_token()

        result = self.client.post(
            self.endpoint,
            self.data,
            content_type='application/json',
            HTTP_AUTHORIZATION="Bearer " + token
        )

        self.assertEqual(result.status_code, 201)
        self.assertTrue(result.data['ok'])
        self.assertEqual(init_count + 1, Project.objects.count())

class ProjectViewSetTest(TestCase, MOCK_PROJECT):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.project = Project.objects.create(
            name=cls.data['name'],
            description=cls.data['description']
        )
        cls.users = CustomUser.objects.bulk_create([
            CustomUser(
                username=f"name_{i}",
                password="pass",
                is_superuser=not i
            )
            for i in range(3)
        ])
        for form in cls.data['attributes']: cls.project.add_attributes(form)
        cls.project.user_visible.add(cls.users[-1].id)
        cls.project.user_edit.add(cls.users[-1].id)

    def test_invalid_requests(self):
        token = self.users[1].emit_token()
        endpoint = f"{self.endpoint}{str(self.project.id)}/"

        self.assertEqual(self.client.get(endpoint).status_code, 403)
        self.assertEqual(self.client.patch(endpoint).status_code, 403)
        self.assertEqual(self.client.delete(endpoint).status_code, 403)

        self.assertEqual(
            self.client
                .get(endpoint, HTTP_AUTHORIZATION="Bearer " + token)
                .status_code,
            403
        )
        self.assertEqual(
            self.client
                .patch(endpoint, HTTP_AUTHORIZATION="Bearer " + token)
                .status_code,
            403
        )
        self.assertEqual(
            self.client
                .delete(endpoint, HTTP_AUTHORIZATION="Bearer " + token)
                .status_code,
            403
        )

        deleted_project = Project.objects.create(name="some", visible=False)
        deleted_endpoint = f"{self.endpoint}{deleted_project.id}/"
        admin_token = self.users[0].emit_token()
        self.assertEqual(
            self.client
                .get(deleted_endpoint, HTTP_AUTHORIZATION="Bearer " + admin_token)
                .status_code,
            404
        )

    def test_get_project(self):
        endpoint = f'{self.endpoint}{self.project.id}/'
        admin_token = self.users[0].emit_token()
        collector_token = self.users[-1].emit_token()

        result_1 = self.client.get(
            endpoint,
            HTTP_AUTHORIZATION="Bearer " + admin_token
        )
        result_2 = self.client.get(
            endpoint,
            HTTP_AUTHORIZATION="Bearer " + collector_token
        )

        self.assertTrue(result_1.status_code == result_2.status_code == 200)

        self.assertTrue(
            result_1.data["name"]
            == result_2.data["name"]
            == self.project.name
        )

    def test_patch_project(self):
        self._patch_mixin(self.users[0])
        self._patch_mixin(self.users[-1])

    def _patch_mixin(self, user):
        token = user.emit_token()
        new_name = 'patch_' + user.username

        patch_data = {
            'name': new_name,
            "attributes": self.data["attributes"]
        }

        patch_data["attributes"][1]['levels'][0]['name'] = new_name

        result = self.client.patch(
            f'{self.endpoint}{self.project.id}/',
            patch_data,
            content_type='application/json',
            HTTP_AUTHORIZATION="Bearer " + token
        )

        updated_project = Project.objects.get(id=self.project.id)

        self.assertTrue(result.status_code == 202)
        self.assertTrue(result.data['ok'])
        self.assertEqual(updated_project.name, new_name)
        self.assertEqual(updated_project.level_set.last().name, new_name)

    def test_delete_project(self):
        self._delete_mixin(self.users[0])
        self._delete_mixin(self.users[-1])

    def _delete_mixin(self, user):
        token = user.emit_token()
        project = Project.objects.create(name="some")

        if not user.is_superuser:
            project.user_edit.add(user.id)
            project.user_visible.add(user.id)

        self.assertTrue(project.visible)

        result = self.client.delete(
            f'{self.endpoint}{project.id}/',
            {'approval': project.name},
            content_type='application/json',
            HTTP_AUTHORIZATION="Bearer " + token
        )

        updated_project = Project.objects.get(id=project.id)
        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.data["deleted"])
        self.assertFalse(updated_project.visible)
