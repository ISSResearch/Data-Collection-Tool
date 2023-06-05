from django.test import TestCase
from project.services import Project, update_project
from .mock_project import MOCK_PROJECT


class ProjectUpdateService(TestCase, MOCK_PROJECT):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        ProjectUpdateService.project = Project.objects.create(
            name=cls.data['name'],
            description=cls.data['description']
        )
        for form in cls.data['attributes']: cls.project.add_attributes(form)

    def test_update_project_name_service(self):
        request = type('request', (object,), {'data': {'name': 'TestUpdateName'}})

        valid, _ = update_project(request, self.project.id)

        updated_project = Project.objects.get(id=self.project.id)

        self.assertTrue(valid)
        self.assertEqual(updated_project.name, 'TestUpdateName')

    def test_update_project_desciption_service(self):
        request = type('request', (object,), {'data': {'description': 'TestUpdateDesctiption'}})

        valid, _ = update_project(request, self.project.id)

        updated_project = Project.objects.get(id=self.project.id)

        self.assertTrue(valid)
        self.assertEqual(updated_project.description, 'TestUpdateDesctiption')

    def test_update_project_attributes_service(self):
        request_attributes = self.data['attributes']
        request_attributes[1]['levels'][0]['name'] = 'newtestname'
        request_attributes[1]['levels'][0]['multiple'] = True
        request_attributes[1]['levels'][0]['required'] = True
        request = type('request', (object,), {'data': {'attributes': request_attributes}})

        valid, _ = update_project(request, self.project.id)

        updated_project = Project.objects.get(id=self.project.id)

        self.assertTrue(valid)
        self.assertEqual(updated_project.level_set.last().name, 'newtestname')
        self.assertTrue(updated_project.level_set.last().name)
        self.assertTrue(updated_project.level_set.last().name)

    def test_update_project_service(self):
        request_attributes = self.data['attributes']
        request_attributes[1]['levels'][0]['name'] = 'newtestname'
        request_attributes[1]['levels'][0]['multiple'] = True
        request_attributes[1]['levels'][0]['required'] = True
        request = type('request', (object, ), {
            'data': {
                'name': 'TestUpdateName',
                'description': 'TestUpdateDesctiption',
                'attributes': request_attributes
            }
        })

        valid, _ = update_project(request, self.project.id)

        updated_project = Project.objects.get(id=self.project.id)

        self.assertTrue(valid)
        self.assertEqual(updated_project.name, 'TestUpdateName')
        self.assertEqual(updated_project.description, 'TestUpdateDesctiption')
        self.assertEqual(updated_project.level_set.last().name, 'newtestname')
        self.assertTrue(updated_project.level_set.last().name)
        self.assertTrue(updated_project.level_set.last().name)
