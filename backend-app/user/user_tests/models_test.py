from django.test import TestCase
from django.conf import settings
from user.models import CustomUser
from .mock_user import MOCK_ADMIN_DATA, MOCK_COLLECTOR_DATA
from project.models import Project
from jose import jwt, JWTError


class CustomUserModelTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.project = Project.objects.create(name='name', description='description')

    def test_user_creation(self):
        new_collector = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)
        self._check_keys(new_collector, MOCK_COLLECTOR_DATA)

    def test_update_permission(self):
        init_permissions = {
            'visible': False,
            'view': False,
            'upload': False,
            'validate': False,
            'stats': False,
            'download': False,
            'edit': False
        }
        new_collector = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)

        self._check_permissions(new_collector, init_permissions)

        new_permissions = {**init_permissions, "view": True, "download": True}

        new_collector.update_permissions(new_permissions, self.project.id)

        self._check_permissions(new_collector, new_permissions)

    def test_emit_token(self):
        new_collector = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)
        new_collector.emit_token()

        token_settings = settings.SIMPLE_JWT

        jwt.decode(
            new_collector.token,
            token_settings.get("SIGNING_KEY", ""),
            algorithms=token_settings.get("ALGORITHM", "HS256")
        )


    def test_validate_token(self):
        new_collector = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)

        try: new_collector.validate_token()
        except JWTError: self.assertTrue(True)

        new_collector.emit_token()

        new_collector.validate_token()

        new_collector.token = "123"
        new_collector.save()

        self.assertEqual(new_collector.token, "123")

        try: new_collector.validate_token()
        except JWTError: self.assertIsNone(new_collector.token)

    def _check_keys(self, model, mock_data):
        result = all([
            getattr(model, key) == value
            for key, value in mock_data.items()
        ])

        self.assertTrue(result)

    def _check_permissions(self, model, against_permissions):
        self.assertEqual(
            {
                'visible': bool(model.project_visible.all()),
                'view': bool(model.project_view.all()),
                'upload': bool(model.project_upload.all()),
                'validate': bool(model.project_validate.all()),
                'stats': bool(model.project_stats.all()),
                'download': bool(model.project_download.all()),
                'edit': bool(model.project_edit.all())
            },
            against_permissions
        )
