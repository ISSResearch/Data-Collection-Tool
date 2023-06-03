from django.test import TestCase
from .mock_project import MOCK_PROJECT
from project.models import Project
from user.user_tests.mock_user import MOCK_CLASS


class ProjectsViewSetTest(TestCase, MOCK_PROJECT):
    def test_unlogged_requests(self):
        get_request = self.client.get(self.endpoint)
        post_request = self.client.post(self.endpoint)

        self.assertTrue(get_request.status_code == 403)
        self.assertTrue(post_request.status_code == 403)

    def test_get_projects(self):
        MOCK_CLASS.create_admin_user(self.client)

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
        self.assertTrue(bool(
            projects[0].name == self.data['name'] + '0'
            and projects[0].description == self.data['description'] + '0'
        ))

    def test_create_project(self): ...


class ProjectViewSetTest(TestCase, MOCK_PROJECT):
    def test_unlogged_requests(self):
        get_request = self.client.get(self.endpoint)
        update_request = self.client.post(self.endpoint)
        delete_request = self.client.post(self.endpoint)

        self.assertTrue(get_request.status_code == 403)
        self.assertTrue(update_request.status_code == 403)
        self.assertTrue(delete_request.status_code == 403)

    def test_get_project(self): ...

    def test_update_project(self): ...

    def test_delete_project(self): ...
