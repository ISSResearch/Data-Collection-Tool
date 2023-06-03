from django.test import TestCase
from project.models import Project
from .mock_project import MOCK_PROJECT


class ProjectModelTest(TestCase, MOCK_PROJECT):
    def test_project_model_create(self):
        new_project = Project.objects.create(
            name=self.data['name'],
            description=self.data['description']
        )
        for form in self.data['attributes']: new_project.add_attributes(form)

        self.assertTrue(
            all([
                key in tuple(new_project.__dict__)
                for key in
                ('id', 'name', 'description', 'created_at', 'visible', 'reason_if_hidden')
            ])
          )
        self.assertEqual(new_project.name, self.data['name'])
        self.assertEqual(new_project.description, self.data['description'])
        self.assertEqual(new_project.level_set.count(), self.count_levels())
        self.assertEqual(new_project.attribute_set.count(), self.count_attributes())
