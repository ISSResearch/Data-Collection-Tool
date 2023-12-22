from django.test import TestCase
from project.services import Project, ViewSetServices
from .mock_project import MOCK_PROJECT
from user.models import CustomUser


class ProjectViewSetTest(TestCase, MOCK_PROJECT, ViewSetServices):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.projects = Project.objects.bulk_create([
            Project(name=cls.data['name'] + str(i))
            for i in range(2)
        ])
        cls.users = CustomUser.objects.bulk_create([
            CustomUser(
                username=f"name_{i}",
                password="pass",
                is_superuser=not bool(i)
            )
            for i in range(3)
        ])

        for form in cls.data['attributes']: cls.projects[0].add_attributes(form)
        cls.projects[0].user_visible.add(cls.users[1].id)

    def test_get_projects(self):
        for available_for, user in zip((2, 1, 0), self.users):
            result = self._get_available_projects(user).data
            self.assertEqual(len(result), available_for)

    def test_invalid_create_project(self):
        init_count = Project.objects.count()
        result, status = self._create_project({"name": ""})

        self.assertFalse(result["ok"])
        self.assertIsNotNone(result.get("errors"))
        self.assertEqual(status, 400)
        self.assertEqual(init_count, Project.objects.count())

    def test_create_project(self):
        init_count = Project.objects.count()
        result, status = self._create_project({
            "name": "name",
            "description": "description"
        })

        self.assertTrue(result["ok"])
        self.assertIsNone(result.get("errors"))
        self.assertEqual(status, 201)
        self.assertEqual(init_count + 1, Project.objects.count())

    def test_get_unexisted_project(self):
        result, code = self._get_project(
            Project.objects.count(),
            type("request", (object,), {})
        )

        self.assertEqual(code, 404)
        self.assertEqual(result["message"], "query project does not exist")

    def test_get_project(self):
        ...

    def test_patch_project(self):
        ...

    def test_delete_project(self):
        ...
    # def test_update_project_name_service(self):
    #     request = type('request', (object,), {'data': {'name': 'TestUpdateName'}})

    #     valid, _ = update_project(request, self.project.id)

    #     updated_project = Project.objects.get(id=self.project.id)

    #     self.assertTrue(valid)
    #     self.assertEqual(updated_project.name, 'TestUpdateName')

    # def test_update_project_desciption_service(self):
    #     request = type('request', (object,), {'data': {'description': 'TestUpdateDesctiption'}})

    #     valid, _ = update_project(request, self.project.id)

    #     updated_project = Project.objects.get(id=self.project.id)

    #     self.assertTrue(valid)
    #     self.assertEqual(updated_project.description, 'TestUpdateDesctiption')

    # def test_update_project_attributes_service(self):
    #     request_attributes = self.data['attributes']
    #     request_attributes[1]['levels'][0]['name'] = 'newtestname'
    #     request_attributes[1]['levels'][0]['multiple'] = True
    #     request_attributes[1]['levels'][0]['required'] = True
    #     request = type('request', (object,), {'data': {'attributes': request_attributes}})

    #     valid, _ = update_project(request, self.project.id)

    #     updated_project = Project.objects.get(id=self.project.id)

    #     self.assertTrue(valid)
    #     self.assertEqual(updated_project.level_set.last().name, 'newtestname')
    #     self.assertTrue(updated_project.level_set.last().name)
    #     self.assertTrue(updated_project.level_set.last().name)

    # def test_update_project_service(self):
    #     request_attributes = self.data['attributes']
    #     request_attributes[1]['levels'][0]['name'] = 'newtestname'
    #     request_attributes[1]['levels'][0]['multiple'] = True
    #     request_attributes[1]['levels'][0]['required'] = True
    #     request = type('request', (object, ), {
    #         'data': {
    #             'name': 'TestUpdateName',
    #             'description': 'TestUpdateDesctiption',
    #             'attributes': request_attributes
    #         }
    #     })

    #     valid, _ = update_project(request, self.project.id)

    #     updated_project = Project.objects.get(id=self.project.id)

    #     self.assertTrue(valid)
    #     self.assertEqual(updated_project.name, 'TestUpdateName')
    #     self.assertEqual(updated_project.description, 'TestUpdateDesctiption')
    #     self.assertEqual(updated_project.level_set.last().name, 'newtestname')
    #     self.assertTrue(updated_project.level_set.last().name)
    #     self.assertTrue(updated_project.level_set.last().name)
