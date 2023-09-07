from django.test import TestCase
from user.models import CustomUser
from .mock_user import MOCK_ADMIN_DATA, MOCK_COLLECTOR_DATA
from project.models import Project


class CustomUserModelTest(TestCase):
    def test_user_model(self):
        new_admin = CustomUser.objects.create(**MOCK_ADMIN_DATA)
        new_collector = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)
        project = Project.objects.create(name='name', description='description')

        for key, value in MOCK_ADMIN_DATA.items():
            self.assertEqual(getattr(new_admin, key), value)

        for key, value in MOCK_COLLECTOR_DATA.items():
            self.assertEqual(getattr(new_collector, key), value)

        self.assertEqual(
            {
                'visible': bool(new_collector.project_visible.all()),
                'view': bool(new_collector.project_view.all()),
                'upload': bool(new_collector.project_upload.all()),
                'validate': bool(new_collector.project_validate.all()),
                'stats': bool(new_collector.project_stats.all()),
                'download': bool(new_collector.project_download.all()),
                'edit': bool(new_collector.project_edit.all())
            },
            {'visible': False, 'view': False, 'upload': False, 'validate': False, 'stats': False, 'download': False, 'edit': False}
        )

        new_collector.update_permissions(
            {'visible': True, 'view': True, 'upload': True, 'validate': True, 'stats': True, 'download': True, 'edit': True},
            project.id
        )

        self.assertEqual(
            {
                'visible': bool(new_collector.project_visible.all()),
                'view': bool(new_collector.project_view.all()),
                'upload': bool(new_collector.project_upload.all()),
                'validate': bool(new_collector.project_validate.all()),
                'stats': bool(new_collector.project_stats.all()),
                'download': bool(new_collector.project_download.all()),
                'edit': bool(new_collector.project_edit.all())
            },
            {'visible': True, 'view': True, 'upload': True, 'validate': True, 'stats': True, 'download': True, 'edit': True},
        )
