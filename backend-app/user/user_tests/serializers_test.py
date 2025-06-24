from django.test import TestCase
from user.serializers import CustomUser, CollectorSerializer, UserSerializer
from .mock_user import MOCK_COLLECTOR_DATA, DEFAULT_PERMISSIONS
from project.models import Project


class UserSerializerTest(TestCase):
    FIELDS = ("id", "username", "is_superuser")

    def test_user_serialization(self):
        user = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)
        user_data = UserSerializer(user).data

        self.assertEqual(
            [user.__dict__.get(field) for field in self.FIELDS],
            [user_data.get(field) for field in self.FIELDS],
        )


class CollectorSerializerTest(TestCase):
    FIELDS = ("id", "username")

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.project = Project.objects.create(name='name', description='description')
        cls.user = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)

    def test_collector_serialization(self):
        permissions = {**DEFAULT_PERMISSIONS}
        initial_serialized_collectors = CollectorSerializer(
            self.user,
            context={'project_id': self.project.id}
        ).data

        self.assertEqual(
            [self.user.__dict__.get(field) for field in self.FIELDS],
            [initial_serialized_collectors.get(field) for field in self.FIELDS],
        )

        self.assertEqual(
            initial_serialized_collectors['permissions'],
            permissions
        )

        self.project.user_visible.add(self.user)
        self.project.user_edit.add(self.user)
        permissions["visible"] = True
        permissions["edit"] = True

        new_serialized_collectors = CollectorSerializer(
            self.user,
            context={'project_id': self.project.id}
        ).data

        self.assertEqual(new_serialized_collectors['permissions'], permissions)
