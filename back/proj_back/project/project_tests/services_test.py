from django.test import TestCase
from project.services import Project, update_project
from .mock_project import MOCK_PROJECT


class ProjectUpdateService(TestCase, MOCK_PROJECT):
    def test_update_project_name_service(self):
        project = Project.objects.create(
            name=self.data['name'],
            description=self.data['description'],
        )

        request = type('request', (object, ), {
            'data': {
                'name': 'TestUpdateName',
            }
        })

        valid, _ = update_project(request, project.id)

        updated_project = Project.objects.get(id=project.id)

        self.assertTrue(valid)
        self.assertEqual(updated_project.name, 'TestUpdateName')

    def test_update_project_desciption_service(self):
        project = Project.objects.create(
            name=self.data['name'],
            description=self.data['description'],
        )

        request = type('request', (object, ), {
            'data': {
                'description': 'TestUpdateDesctiption',
            }
        })

        valid, _ = update_project(request, project.id)

        updated_project = Project.objects.get(id=project.id)

        self.assertTrue(valid)
        self.assertEqual(updated_project.description, 'TestUpdateDesctiption')

    def test_update_project_attributes_service(self):
        project = Project.objects.create(
            name=self.data['name'],
            description=self.data['description'],
        )
        for form in self.data['attributes']: project.add_attributes(form)

        request_attributes = self.data['attributes']
        request_attributes[1]['levels'][0]['name'] = 'newtestname'
        request_attributes[1]['levels'][0]['multiple'] = True
        request_attributes[1]['levels'][0]['required'] = True
        request = type('request', (object, ), {
            'data': {
                'attributes': request_attributes
            }
        })

        valid, _ = update_project(request, project.id)

        updated_project = Project.objects.get(id=project.id)

        self.assertTrue(valid)
        self.assertEqual(updated_project.level_set.last().name, 'newtestname')
        self.assertTrue(updated_project.level_set.last().name)
        self.assertTrue(updated_project.level_set.last().name)

    def test_update_project_service(self):
        project = Project.objects.create(
            name=self.data['name'],
            description=self.data['description'],
        )
        for form in self.data['attributes']: project.add_attributes(form)

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

        valid, _ = update_project(request, project.id)

        updated_project = Project.objects.get(id=project.id)

        self.assertTrue(valid)
        self.assertEqual(updated_project.name, 'TestUpdateName')
        self.assertEqual(updated_project.description, 'TestUpdateDesctiption')
        self.assertEqual(updated_project.level_set.last().name, 'newtestname')
        self.assertTrue(updated_project.level_set.last().name)
        self.assertTrue(updated_project.level_set.last().name)
