from django.test import TestCase
from .mock_project import MOCK_PROJECT
from project.serializers import Project, ProjectSerializer, ProjectsSerializer


class ProjectSerializerTest(TestCase, MOCK_PROJECT):
    def test_serializer_output(self):
        project = Project.objects.create(
            name=self.data['name'],
            description=self.data['description']
        )

        for form in self.data['attributes']: project.add_attributes(form)

        serialized_project = ProjectSerializer(project)

        self.assertEqual(
            set(serialized_project.data.keys()),
            {'id', 'attributes', 'name', 'description', 'created_at', 'visible', 'reason_if_hidden'}
        )
        self.assertEqual(
            {
                value for key, value in serialized_project.data.items()
                if key in {'name', 'description'}
            },
            {
                value for key, value in self.data.items()
                if key in {'name', 'description'}
            }
        )
        self.assertEqual(
            serialized_project.data['attributes'][0]['name'],
            self.data['attributes'][0]['levels'][0]['name']
        )


class ProjectsSerializerTest(TestCase, MOCK_PROJECT):
    def test_serializer_output(self):
        projects = Project.objects.bulk_create(
            Project(**project) for project in [
                {
                    'name': self.data['name'] + 'many1',
                    'description': self.data['description']
                },
                {
                    'name': self.data['name'] + 'many2',
                    'description': self.data['description']
                },
                {
                    'name': self.data['name'] + 'many3',
                    'description': self.data['description']
                },
            ]
        )

        serialized_projects = ProjectsSerializer(projects, many=True)

        self.assertEqual(len(serialized_projects.data), len(projects))
        self.assertEqual(
            set(serialized_projects.data[0].keys()),
            {'id', 'name', 'description', 'created_at', 'visible', 'reason_if_hidden'}
        )
        self.assertEqual(
            {
                value for key, value in serialized_projects.data[0].items()
                if key in {'name', 'description'}
            },
            {
                value if key != 'name' else self.data['name'] + 'many1'
                for key, value in self.data.items()
                if key in {'name', 'description'}
            }
        )