from django.test import TestCase
from user.serializers import UserSerializer, CustomUser
from .mock_user import MOCK_ADMIN_DATA


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
