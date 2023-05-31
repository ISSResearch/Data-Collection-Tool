from django.test import TestCase
from project.models import Project
from .mock_project import MOCK_PROJECT


class ProjectModelTest(TestCase):
    def test_project_model_create(self):
        new_project = Project.objects.create(
            name=MOCK_PROJECT.data['name'],
            description=MOCK_PROJECT.data['description']
        )
        for form in MOCK_PROJECT.data['attributes']: new_project.add_attributes(form)

        self.assertTrue(
            all([
                key in tuple(new_project.__dict__)
                for key in
                ('id', 'name', 'description', 'created_at', 'visible', 'reason_if_hidden')
            ])
          )
        self.assertEqual(new_project.name, MOCK_PROJECT.data['name'])
        self.assertEqual(new_project.description, MOCK_PROJECT.data['description'])
        self.assertEqual(
            new_project.level_set.all().count(),
            MOCK_PROJECT.count_levels()
        )
        self.assertEqual(
            new_project.attribute_set.all().count(),
            MOCK_PROJECT.count_attributes()
        )
