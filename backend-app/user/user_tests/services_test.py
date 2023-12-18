from django.test import TestCase
from project.services import Project
from user.services import (
    _set_user_permissions,
    _proceed_create,
    _proceed_login,
    _get_collectors
)
from user.serializers import CustomUser, CollectorSerializer
from .mock_user import DEFAULT_PERMISSIONS, MOCK_COLLECTOR_DATA


class SetUserPermissionTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = CustomUser.objects.create(
            username='test_user',
            password='test_password'
        )
        cls.project = Project.objects.create(
            name='name',
            description='description'
        )

    def test_set_user_permissions(self):
        permissions = {**DEFAULT_PERMISSIONS}
        init_permissions = CollectorSerializer(
            self.user,
            context={'project_id': self.project.id}
        ).data

        self.assertEqual(init_permissions['permissions'], permissions)

        permissions = {**permissions, "visible": True, "edit": True, "view": True}

        _set_user_permissions(
            {'users': [{'user_id': self.user.id, 'permissions': permissions}]},
            self.project.id
        )

        new_permissions = CollectorSerializer(self.user, context={'project_id': self.project.id}).data
        self.assertEqual(new_permissions['permissions'], permissions)


class ProceedCreateTest(TestCase):
    def test_invalid_create(self):
        init_user_count = CustomUser.objects.count()

        invalid_create_1 = _proceed_create({
            'username': 'invalid-name-1',
            'password1': 'QwE1@asdZ45',
            'password2': 'qweasd',
        })
        invalid_create_2 = _proceed_create({
            'username': 'invalid-name-2',
            'password1': 'QwE1@asdZ45',
            'password2': '',
        })
        invalid_create_3 = _proceed_create({
            'username': 'invalid-name-2',
            'password1': '',
            'password2': '',
        })

        self.assertEqual(init_user_count, CustomUser.objects.count())

        self.assertFalse(invalid_create_1["isAuth"])
        self.assertFalse(invalid_create_2["isAuth"])
        self.assertFalse(invalid_create_3["isAuth"])

        self.assertEqual(invalid_create_1["error"], 1)
        self.assertEqual(invalid_create_2["error"], 1)
        self.assertEqual(invalid_create_3["error"], 2)

        self.assertEqual(
            invalid_create_1["errors"].get("password2"),
            "The two password fields didn’t match."
        )
        self.assertTrue(
            invalid_create_2["errors"].get("password2"),
            "This field is required."
        )
        self.assertTrue(
            invalid_create_3["errors"].get("password1"),
            "This field is required."
        )
        self.assertTrue(
            invalid_create_3["errors"].get("password2"),
            "This field is required."
        )


    def test_valid_create(self):
        valid_create = _proceed_create({
            **MOCK_COLLECTOR_DATA,
            "password2": MOCK_COLLECTOR_DATA["password"]
        })

        self.assertTrue(valid_create["isAuth"])
        self.assertIsNotNone(valid_create["user"])
        self.assertIsNone(valid_create["errors"])
