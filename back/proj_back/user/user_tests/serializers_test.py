from django.test import TestCase
from user.serializers import UserSerializer, CustomUser


class CustomUserSerializerTest(TestCase):
    def test_serializer_output(self):
        serialized_user = UserSerializer(CustomUser.objects.first())

        self.assertEqual(
            tuple(serialized_user.data.keys()),
            ('username', 'user_role', 'is_superuser')
        )
