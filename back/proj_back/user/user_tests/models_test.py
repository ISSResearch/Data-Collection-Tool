from django.test import TestCase
from user.models import CustomUser
from .mock_user import MOCK_ADMIN_DATA, MOCK_COLLECTOR_DATA


class CustomUserModelTest(TestCase):
    def test_create_user(self):
        new_admin = CustomUser.objects.create(**MOCK_ADMIN_DATA)
        new_collector = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)

        for key, value in MOCK_ADMIN_DATA.items():
            self.assertEqual(getattr(new_admin, key), value)

        for key, value in MOCK_COLLECTOR_DATA.items():
            self.assertEqual(getattr(new_collector, key), value)
