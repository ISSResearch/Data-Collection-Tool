from django.test import TestCase
from django.db.models import QuerySet
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

        self._test_invalid_result({
            'username': 'invalid-name-1',
            'password1': 'QwE1@asdZ45',
            'password2': 'qweasd',
        })
        self._test_invalid_result({
            'username': 'invalid-name-2',
            'password1': 'QwE1@asdZ45',
            'password2': '',
        })
        self._test_invalid_result({
            'username': 'invalid-name-2',
            'password1': '',
            'password2': '',
        })

        self.assertEqual(init_user_count, CustomUser.objects.count())

    def _test_invalid_result(self, credentials):
        error_count = len(list(filter(lambda x: not x[1], credentials)))

        result, code = _proceed_create(credentials)

        self.assertEqual(code, 200)
        self.assertFalse(result['isAuth'])
        self.assertIsNone(result.get("user"))
        self.assertIsNone(result.get("accessToken"))

        if error_count:
            self.assertEqual(len(result["errors"]), error_count)
        else: self.assertIsNotNone(result.get("errors"))

    def test_valid_create(self):
        init_user_count = CustomUser.objects.count()

        result, code = _proceed_create({
            "username": MOCK_COLLECTOR_DATA["username"],
            "password1": MOCK_COLLECTOR_DATA["password"],
            "password2": MOCK_COLLECTOR_DATA["password"]
        })

        self.assertEqual(code, 201)
        self.assertTrue(result["isAuth"])
        self.assertIsNotNone(result["user"])
        self.assertIsNone(result.get("errors"))

        self.assertEqual(init_user_count + 1, CustomUser.objects.count())


class ProceedLoginTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = CustomUser.objects.create(username='test_user')
        cls.user.set_password("test_password")
        cls.user.save()

    def test_invalid_login(self):
        self.assertIsNone(CustomUser.objects.get(id=self.user.id).token)

        invalid_login = _proceed_login({
            "username": "invalid",
            "password": "invalid"
        })

        self.assertFalse(invalid_login["isAuth"])
        self.assertIsNone(invalid_login.get("accessToken"))
        self.assertIsNone(invalid_login.get("user"))
        self.assertEqual(
            invalid_login["message"],
            "No user found or wrong credentials"
        )

        self.assertIsNone(CustomUser.objects.get(id=self.user.id).token)

    def test_valid_login(self):
        self.assertIsNone(CustomUser.objects.get(id=self.user.id).token)

        valid_login = _proceed_login({
            "username": "test_user",
            "password": "test_password"
        })

        self.assertTrue(valid_login["isAuth"])
        self.assertIsNotNone(valid_login.get("accessToken"))
        self.assertIsNotNone(valid_login.get("user"))
        self.assertIsNone(valid_login.get("message"))

        self.assertIsNotNone(CustomUser.objects.get(id=self.user.id).token)


class GetCollectiorsTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        creds = (
            {**MOCK_COLLECTOR_DATA, "username": f"name_{i}"}
            for i in range(5)
        )
        cls.users = [CustomUser.objects.create(**user) for user in creds]
        cls.admin = CustomUser.objects.create(
            **MOCK_COLLECTOR_DATA,
            is_superuser=True
        )
        cls.project = Project.objects.create(name="project", description="description")
        cls.project.user_upload.set([u.id for u in cls.users])
        cls.project.user_stats.set([u.id for u in cls.users if u.id % 2])
        cls.project.user_download.set([u.id for u in cls.users if not u.id % 2])

    def test_get_queryset(self):
        result = _get_collectors(self.project.id)

        names = {u.username for u in self.users}


        self.assertTrue(isinstance(result, QuerySet))
        self.assertEqual(
            sum([u.username in names for u in result]),
            len(self.users)
        )

        result = list(result)

        self.assertTrue(all([
            self.project.id in u.project_upload.values_list("id", flat=True)
            for u in result
            if u.username in names
        ]))
        self.assertTrue(all([
            self.project.id in u.project_stats.values_list("id", flat=True)
            for u in result
            if u.id % 2
        ]))
        self.assertTrue(all([
            self.project.id in u.project_download.values_list("id", flat=True)
            for u in result
            if not u.id % 2
            and u.username in names
        ]))
        self.assertFalse(all([
            self.project.id in u.project_stats.values_list("id", flat=True)
            for u in result
            if not u.id % 2
        ]))
        self.assertFalse(all([
            self.project.id in u.project_download.values_list("id", flat=True)
            for u in result
            if u.id % 2
        ]))

    def test_get_serialized(self):
        result = _get_collectors(self.project.id, True)

        self.assertTrue(isinstance(result.data, list))

        result = result.data

        names = {u.username for u in self.users}

        self.assertEqual(
            sum([u["username"] in names for u in result]),
            len(self.users),
        )
        self.assertTrue(all([u["permissions"]["upload"] for u in result if u["username"] in names]))
        self.assertTrue(all([u["permissions"]["stats"] for u in result if u["id"] % 2 and u["username"] in names]))
        self.assertTrue(all([u["permissions"]["download"] for u in result if not u["id"] % 2 and u["username"] in names]))
        self.assertFalse(all([u["permissions"]["stats"] for u in result if not u["id"] % 2 and u["username"] in names]))
        self.assertFalse(all([u["permissions"]["download"] for u in result if u["id"] % 2 and u["username"] in names]))
