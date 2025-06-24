from django.test import TestCase
from .mock_project import MOCK_PROJECT
from project.serializers import Project, ProjectSerializer, ProjectsSerializer
from user.models import CustomUser


class ProjectsSerializerTest(TestCase, MOCK_PROJECT):
    def test_create_project(self):
        project = ProjectsSerializer(data=self.data)

        self.assertTrue(project.is_valid())

        project.save()

        self.assertIsNotNone(project.instance)

        project.add_attributes()

        self.assertEqual(project.instance.level_set.count(), self.count_levels())
        self.assertEqual(
            project.instance.attribute_set.count(),
            self.count_attributes()
        )

    def test_serializer_output(self):
        projects = Project.objects.bulk_create(
            Project(name=f"name_{i}", description="description")
            for i in range(5)
        )

        serialized_projects = ProjectsSerializer(projects, many=True)

        self.assertEqual(len(serialized_projects.data), len(projects))
        self.assertEqual(
            set(serialized_projects.data[0].keys()),
            {"id", "name", "description", "payload_required", "created_at"}
        )


class ProjectSerializerTest(TestCase, MOCK_PROJECT):
    def test_serializer(self):
        project = Project.objects.create(
            name=self.data['name'],
            description=self.data['description']
        )
        user = CustomUser.objects.create(username='user', password='password')
        project.user_visible.add(user.id)
        project.user_edit.add(user.id)

        for form in self.data['attributes']: project.add_attributes(form)

        serialized_project = ProjectSerializer(
            project,
            context={'request': type('request', (object,), {'user': user})}
        )

        self.assertEqual(
            set(serialized_project.data.keys()),
            {"id", "name", "description", "attributes", "payload_required", "permissions"}
        )
        self.assertEqual(
            serialized_project.data['attributes'][0]['name'],
            self.data['attributes'][0]['levels'][0]['name']
        )
        self.assertEqual(
            serialized_project.data['attributes'][0]['name'],
            self.data['attributes'][0]['levels'][0]['name']
        )
        self.assertEqual(
            serialized_project.data['permissions'],
            {
                "goals": False,
                "upload": False,
                "view": False,
                "validate": False,
                "stats": False,
                "download": False,
                "edit": True
            }
        )
