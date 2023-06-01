from django.test import TestCase
from .mock_project import MOCK_PROJECT
from project.models import Project


class ProjectsViewSetTest(TestCase, MOCK_PROJECT):
    def test_get_projects(self): ...

    def test_create_project(self): ...


class ProjectViewSetTest(TestCase, MOCK_PROJECT):
    def test_get_project(self): ...

    def test_update_project(self): ...

    def test_delete_project(self): ...
