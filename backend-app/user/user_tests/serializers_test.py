from django.test import TestCase
from user.serializers import UserSerializer, CustomUser, CollectorSerializer
from .mock_user import MOCK_ADMIN_DATA, MOCK_COLLECTOR_DATA
from project.models import Project


class CustomUserSerializerTest(TestCase):
    def test_serializer_output(self):
        serialized_user = UserSerializer(
            CustomUser.objects.create(**MOCK_ADMIN_DATA)
        )

        self.assertEqual(
            set(serialized_user.data.keys()),
            {'id', 'username', 'is_superuser'}
        )
        self.assertEqual(
            {
                value for key, value in serialized_user.data.items()
                if key in {'name', 'is_superuser'}
            },
            {
                value for key, value in MOCK_ADMIN_DATA.items()
                if key in {'name', 'is_superuser'}
            }
        )


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
            {'view': False, 'upload': False, 'validate': False, 'stats': False, 'download': False, 'edit': False}
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
            {'view': True, 'upload': False, 'validate': False, 'stats': False, 'download': False, 'edit': True}
        )
