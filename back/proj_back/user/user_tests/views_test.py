from django.test import TestCase
from .mock_user import MOCK_ADMIN_DATA, MOCK_ENDPOINTS, MOCK_COLLECTOR_DATA


class UserLoginViewTest(TestCase, MOCK_ENDPOINTS):
    def test_invalid_login_endpoint(self):
        response = self.client.post(self.login_endpoint, {
            'username': 'invalid_name',
            'passowrd': MOCK_ADMIN_DATA['password'] + '123zxcASD'
        })
        status, valid = self.check_login()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['message'], 'No user found or wrong credentials')
        self.assertIs(response.data['isAuth'], False)
        self.assertIs(response.data.get('user', None), None)
        self.assertIs(status == 200 and valid, False)

    def test_valid_login_endpoint(self):
        response = self.client.post(self.login_endpoint, {
            'username': MOCK_ADMIN_DATA['username'],
            'passowrd': MOCK_ADMIN_DATA['password']
        })
        status, valid = self.check_login()

        self.assertEqual(response.status_code, 200)
        self.assertIs(response.data['isAuth'], True)
        self.assertEqual(
            tuple(response.data['user'].keys()),
            ('id', 'username', 'user_role', 'is_superuser')
        )
        self.assertIs(status == 200 and valid, True)


class UserLogoutViewsTest(TestCase, MOCK_ENDPOINTS):
    def test__logout__endpoint(self):
        response = self.client.get(self.logout_endpoint)

        self.assertEqual(response.status_code, 200)


class UserCheckViewTest(TestCase, MOCK_ENDPOINTS):
    def test_unlogged_check_endpoint(self):
        _, valid = self.check_login()
        if valid: self.client.get(self.logout_endpoint)

        response = self.client.get(self.check_endpoint)

        self.assertEqual(response.status_code, 200)
        self.assertIs(response.data.get('isAuth', None), False)

    def test_logged_check_endpoint(self):
        _, valid = self.check_login()
        if not valid:
            response = self.client.post(self.login_endpoint, {
                'username': MOCK_ADMIN_DATA['username'],
                'passowrd': MOCK_ADMIN_DATA['password']
            })

        response = self.client.get(self.check_endpoint)

        self.assertEqual(response.status_code, 200)
        self.assertIs(response.data.get('isAuth', None), True)
        self.assertEqual(
            tuple(response.data['user'].keys()),
            ('id', 'username', 'user_role', 'is_superuser')
        )


class UserCreateViewTest(TestCase, MOCK_ENDPOINTS):
    def test_invalid_create_endpoint(self):
        invalid_request_1 = self.client.post(self.create_endpoint, {
            'username': 'invalid-name-1',
            'password1': 'QwE1@asdZ45',
            'password2': 'qweasd',
        })
        invalid_request_2 = self.client.post(self.create_endpoint, {
            'username': 'invalid-name-2',
            'password1': 'QwE1@asdZ45',
            'password2': '',
        })

        self.assertEqual(invalid_request_1.status_code, 200)
        self.assertEqual(invalid_request_2.status_code, 200)
        self.assertEqual(invalid_request_1.json().get('isAuth', None), False)
        self.assertEqual(invalid_request_2.json().get('isAuth', None), False)
        self.assertIs(bool(invalid_request_1.json().get('errors', None)), True)
        self.assertIs(bool(invalid_request_2.json().get('errors', None)), True)

    def test_valid_create_endpoint(self):
        mock_morf = {
            **MOCK_COLLECTOR_DATA,
            'username': MOCK_COLLECTOR_DATA['username'] + 'testview'
        }

        valid_request = self.client.post(self.create_endpoint, {
            'username': mock_morf['username'],
            'password1': mock_morf['password'],
            'password2': mock_morf['password'],
        })

        self.assertEqual(valid_request.status_code, 200)
        self.assertIs(valid_request.data.get('isAuth', None), True)
        self.assertEqual(
            tuple(valid_request.data['user'].keys()),
            ('id', 'username', 'user_role', 'is_superuser')
        )
