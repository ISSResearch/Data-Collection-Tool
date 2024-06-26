from django.test import TestCase
from .mock_user import MOCK_COLLECTOR_DATA
from user.models import CustomUser
from project.models import Project
from json import dumps


class UserCheckViewTest(TestCase):
    ENDPOINT = "/api/users/check/"

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)
        cls.user.emit_token()

    def test_invalid_token_checkout(self):
        result = self.client.get(
            self.ENDPOINT,
            HTTP_AUTHORIZATION="Bearer asdasdas"
        )
        result_2 = self.client.get(self.ENDPOINT)

        self.assertEqual(result.status_code, 403)
        self.assertIsNone(result.data.get("user"))
        self.assertFalse(result.data.get("isAuth"))

        self.assertEqual(result_2.status_code, 403)
        self.assertIsNone(result_2.data.get("user"))
        self.assertFalse(result_2.data.get("isAuth"))

    def test_valid_token_checkout(self):
        result = self.client.get(
            self.ENDPOINT,
            HTTP_AUTHORIZATION="Bearer " + self.user.token
        )

        self.assertEqual(result.status_code, 200)
        self.assertIsNotNone(result.data.get("user"))
        self.assertTrue(result.data.get("isAuth"))


class UserLogoutViewTest(TestCase):
    ENDPOINT = "/api/users/logout/"

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)
        cls.user.set_password(MOCK_COLLECTOR_DATA["password"])
        cls.user.save()
        cls.user.emit_token()

    def test_logout(self):
        self.assertIsNotNone(CustomUser.objects.get(id=self.user.id).token)

        unauth_res = self.client.post(self.ENDPOINT, HTTP_AUTHORIZATION="Bearer asd")
        res = self.client.post(self.ENDPOINT, HTTP_AUTHORIZATION="Bearer " + self.user.token)

        self.assertEqual(unauth_res.status_code, 403)
        self.assertEqual(res.status_code, 200)

        self.assertIsNone(CustomUser.objects.get(id=self.user.id).token)


class UserLoginViewTest(TestCase):
    ENDPOINT = "/api/users/login/"

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = CustomUser.objects.create(**MOCK_COLLECTOR_DATA)
        cls.user.set_password(MOCK_COLLECTOR_DATA["password"])
        cls.user.save()
        cls.user.emit_token()

    def test_invalid_login(self):
        wrong_credetials = self.client.post(self.ENDPOINT, {
            'username': 'invalid_name',
            'password': 'mock_user.password_123zxcASD'
        })
        missed_credentials = self.client.post(self.ENDPOINT, {
            'username': '',
            'password': ''
        })

        self._test_invalid_result(wrong_credetials)
        self._test_invalid_result(missed_credentials)

    def test_valid_result(self):
        result = self.client.post(self.ENDPOINT, {
            'username': MOCK_COLLECTOR_DATA['username'],
            'password': MOCK_COLLECTOR_DATA['password'],
        })

        self.assertEqual(result.status_code, 200)
        self.assertTrue(result.data['isAuth'])
        self.assertIsNotNone(result.data["user"])
        self.assertEqual(
            result.data["accessToken"],
            CustomUser.objects.first().token
        )

    def _test_invalid_result(self, result):
        self.assertEqual(result.status_code, 200)
        self.assertEqual(
            result.data['message'],
            'No user found or wrong credentials'
        )
        self.assertFalse(result.data['isAuth'])
        self.assertIsNone(result.data.get("accessToken"))
        self.assertIsNone(result.data.get('user'))


class UserCreateViewTest(TestCase):
    ENDPOINT = "/api/users/create/"

    def test_invalid_create(self):
        initial_user_count = CustomUser.objects.count()

        self._test_invalid_result((
            ('username', 'invalid-name-1'),
            ('password1', 'QwE1@asdZ45'),
            ('password2', 'qweasd'),
        ))
        self._test_invalid_result((
            ('username', 'invalid-name-1'),
            ('password1', 'QwE1@asdZ45'),
            ('password2', ''),
        ))
        self._test_invalid_result((
            ('username', 'invalid-name-1'),
            ('password1', ''),
            ('password2', ''),
        ))
        self._test_invalid_result((
            ('username', ''),
            ('password1', ''),
            ('password2', ''),
        ))

        self.assertEqual(initial_user_count, CustomUser.objects.count())

    def _test_invalid_result(self, credentials):
        error_count = len(list(filter(lambda x: not x[1], credentials)))

        result = self.client.post(self.ENDPOINT, {
            key: value
            for key, value
            in credentials
        })

        self.assertEqual(result.status_code, 200)
        self.assertFalse(result.data['isAuth'])
        self.assertIsNone(result.data.get("user"))
        self.assertIsNone(result.data.get("accessToken"))

        if error_count:
            self.assertEqual(len(result.data["errors"]), error_count)
        else: self.assertIsNotNone(result.data.get("errors"))

    def test_valid_create_endpoint(self):
        initial_user_count = CustomUser.objects.count()
        self.assertEqual(initial_user_count, 0)

        result = self.client.post(self.ENDPOINT, {
            'username': MOCK_COLLECTOR_DATA['username'],
            'password1': MOCK_COLLECTOR_DATA['password'],
            'password2': MOCK_COLLECTOR_DATA['password'],
        })

        new_user = CustomUser.objects.first()

        self.assertEqual(result.status_code, 201)
        self.assertTrue(result.data["isAuth"])
        self.assertIsNotNone(result.data.get("user"))
        self.assertIsNone(result.data.get("errors"))
        self.assertEqual(result.data["accessToken"], new_user.token)
        self.assertEqual(initial_user_count + 1, CustomUser.objects.count())
        self.assertFalse(new_user.is_superuser)
        self.assertEqual(new_user.username, MOCK_COLLECTOR_DATA["username"])


class CollectorViewSetTest(TestCase):
    ENDPOINT = "/api/users/collectors/"

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.project = Project.objects.create(name="name", description="description")
        cls.users = [
            CustomUser(
                username=MOCK_COLLECTOR_DATA["username"] + str(i),
                password=MOCK_COLLECTOR_DATA["password"]
            )
            for i in range(5)
        ]
        CustomUser.objects.bulk_create(cls.users)

    def test_get_collectors_no_permission(self):
        user, *_ = self.users
        user.emit_token()

        result_1 = self.client.get(self._url)
        result_2 = self.client.get(
            self._url,
            HTTP_AUTHORIZATION="Bearer " + user.token
        )

        self.assertTrue(result_1.status_code == result_2.status_code == 403)

    def test_get_collectors(self):
        user, *_ = self.users
        user.emit_token()
        user.project_view.add(self.project.id)

        result_1 = self.client.get(
            self._url,
            HTTP_AUTHORIZATION="Bearer " + user.token
        )

        user.project_view.remove(self.project.id)
        user.project_edit.add(self.project.id)

        result_2 = self.client.get(
            self._url,
            HTTP_AUTHORIZATION="Bearer " + user.token
        )

        self._check_result(result_1)
        self._check_result(result_2)

    def test_post_collectors_no_permission(self):
        user, *_ = self.users
        user.emit_token()

        result_1 = self.client.patch(self._url)
        result_2 = self.client.patch(
            self._url,
            HTTP_AUTHORIZATION="Bearer " + user.token
        )

        user.project_view.add(self.project.id)

        result_3 = self.client.patch(
            self._url,
            HTTP_AUTHORIZATION="Bearer " + user.token
        )

        self.assertTrue(
            result_1.status_code
            == result_2.status_code
            == result_3.status_code
            == 403
        )

    def test_post_collectors(self):
        user, user_2, *_ = self.users
        user.emit_token()
        user.project_edit.add(self.project.id)

        initial_state = self.client.get(
            self._url,
            HTTP_AUTHORIZATION="Bearer " + user.token
        )
        self.assertTrue(initial_state.status_code, 200)
        self.assertEqual(len(initial_state.data), len(self.users))

        result_1 = self.client.post(
            self._url,
            HTTP_AUTHORIZATION="Bearer " + user.token
        )
        self.assertEqual(result_1.status_code, 403)

        result_2 = self.client.patch(
            self._url,
            HTTP_AUTHORIZATION="Bearer " + user.token
        )
        self.assertEqual(result_2.status_code, 200)
        self.assertEqual(initial_state.data, result_2.data)

        result_3 = self.client.patch(
            self._url,
            HTTP_AUTHORIZATION="Bearer " + user.token,
            CONTENT_TYPE="application/json",
            data=dumps({
                "users": [{
                    "user_id": user_2.id,
                    "permissions": {
                        **initial_state.data[1]["permissions"],
                        "edit": True,
                        "stats": True
                    }
                }]
            })
        )
        self.assertEqual(result_3.status_code, 200)
        self.assertNotEqual(initial_state.data, result_3.data)
        self.assertTrue(all([
            self.project.id in user_2.project_edit.values_list("id", flat=True),
            self.project.id in user_2.project_stats.values_list("id", flat=True),
            result_3.data[1]["permissions"]["edit"],
            result_3.data[1]["permissions"]["stats"],
            not all([
                value
                for key, value
                in result_3.data[2]["permissions"].items()
                if key not in {"edit", "stats"}
            ])
        ]))
        self.assertFalse(all([
            value
            for user in result_3.data[3:]
            for value in user["permissions"].values()
        ]))

    def _check_result(self, result):
        changed_user, *users = result.data

        self.assertEqual(result.status_code, 200)
        self.assertEqual(len(result.data), len(self.users))

        self.assertTrue(any(changed_user["permissions"].values()))
        self.assertFalse(all([
            value
            for user in users
            for value in user["permissions"].values()
        ]))

    @property
    def _url(self): return f"{self.ENDPOINT}{self.project.id}/"
