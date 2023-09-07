from django.test import TestCase
from project.services import Project
from user.services import set_user_permissions
from user.serializers import CustomUser, CollectorSerializer


class SetUserPermissionTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        SetUserPermissionTest.user = CustomUser.objects.create(
            username='test_user',
            password='test_password'
        )
        SetUserPermissionTest.project = Project.objects.create(
            name='name',
            description='description'
        )

    def test_set_user_permissions(self):
        init_permissions = CollectorSerializer(self.user, context={'project_id': self.project.id}).data
        self.assertEqual(
            init_permissions['permissions'],
            {'visible': False, 'view': False, 'upload': False, 'validate': False, 'stats': False, 'download': False, 'edit': False}
        )

        set_user_permissions(
            {
                'users': [
                    {
                        'user_id': self.user.id,
                        'permissions': {
                            'visible': True,
                            'view': True,
                            'upload': False,
                            'validate': True,
                            'stats': False,
                            'download': True,
                            'edit': False
                        }
                    }
                ]
            },
            self.project.id
        )

        new_permissions = CollectorSerializer(self.user, context={'project_id': self.project.id}).data
        self.assertEqual(
            new_permissions['permissions'],
            {'visible': True, 'view': True, 'upload': False, 'validate': True, 'stats': False, 'download': True, 'edit': False}
        )
