from django.test import TestCase
from user.serializers import CustomUser, CollectorSerializer
from .mock_user import MOCK_COLLECTOR_DATA
from project.models import Project


class CollectorTest(TestCase):
    def test_collector_serializer(self):
        collector_user = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)
        project = Project.objects.create(name='name', description='description')

        initial_serialized_collectors = CollectorSerializer(
            CustomUser.objects.filter(is_superuser=False),
            many=True,
            context={'project_id': project.id}
        ).data
        self.assertEqual(
            initial_serialized_collectors[0]['permissions'],
            {'visible': False, 'view': False, 'upload': False, 'validate': False, 'stats': False, 'download': False, 'edit': False}
        )

        project.user_visible.add(collector_user)
        project.user_edit.add(collector_user)

        new_serialized_collectors = CollectorSerializer(
            CustomUser.objects.filter(is_superuser=False),
            many=True,
            context={'project_id': project.id}
        ).data

        self.assertEqual(
            new_serialized_collectors[0]['permissions'],
            {'visible': True, 'view': False, 'upload': False, 'validate': False, 'stats': False, 'download': False, 'edit': True}
        )
