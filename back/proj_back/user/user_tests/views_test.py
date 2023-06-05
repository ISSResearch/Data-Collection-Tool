from django.test import TestCase
from .mock_user import MOCK_CLASS, MOCK_COLLECTOR_DATA
from user.models import CustomUser

class UserLoginViewTest(TestCase, MOCK_CLASS):
    def test_invalid_login_endpoint(self):
        response = self.client.post(self.login_endpoint, {
            'username': 'invalid_name',
            'password': 'mock_user.password_123zxcASD'
        })
        status, valid = self.check_login()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['message'], 'No user found or wrong credentials')
        self.assertFalse(response.data['isAuth'])
        self.assertIs(response.data.get('user', None), None)
        self.assertFalse(status == 200 and valid)

    def test_valid_login_endpoint(self):
        self.client.post(self.create_endpoint, {
            'username': MOCK_COLLECTOR_DATA['username'],
            'password1': MOCK_COLLECTOR_DATA['password'],
            'password2': MOCK_COLLECTOR_DATA['password'],
        })

        response = self.client.post(self.login_endpoint, {
            'username': MOCK_COLLECTOR_DATA['username'],
            'password': MOCK_COLLECTOR_DATA['password'],
        })
        status, valid = self.check_login()

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data['isAuth'])
        self.assertEqual(
            set(response.data['user'].keys()),
            {'id', 'username', 'user_role', 'is_superuser'}
        )
        self.assertTrue(status == 200 and valid)


class UserLogoutViewsTest(TestCase, MOCK_CLASS):
    def test_logout_endpoint(self):
        self.create_admin_user(self.client)

        status, valid = self.check_login()
        self.assertTrue(status == 200 and valid)

        response = self.client.get(self.logout_endpoint)
        status, valid = self.check_login()

        self.assertEqual(response.status_code, 200)
        self.assertFalse(status == 200 and valid)


class UserCheckViewTest(TestCase, MOCK_CLASS):
    def test_unlogged_check_endpoint(self):
        self.client.logout()

        response = self.client.get(self.check_endpoint)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data.get('isAuth', None))

    def test_logged_check_endpoint(self):
        self.create_admin_user(self.client)

        response = self.client.get(self.check_endpoint)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data.get('isAuth', None))
        self.assertEqual(
            set(response.data['user'].keys()),
            {'id', 'username', 'user_role', 'is_superuser'}
        )


class UserCreateViewTest(TestCase, MOCK_CLASS):
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
        self.assertFalse(invalid_request_1.json().get('isAuth', None))
        self.assertFalse(invalid_request_2.json().get('isAuth', None))
        self.assertTrue(bool(invalid_request_1.json().get('errors', None)))
        self.assertTrue(bool(invalid_request_2.json().get('errors', None)))

    def test_valid_create_endpoint(self):
        valid_request = self.client.post(self.create_endpoint, {
            'username': MOCK_COLLECTOR_DATA['username'],
            'password1': MOCK_COLLECTOR_DATA['password'],
            'password2': MOCK_COLLECTOR_DATA['password'],
        })

        self.assertEqual(valid_request.status_code, 200)
        self.assertTrue(valid_request.data.get('isAuth', None))
        self.assertEqual(
            set(valid_request.data['user'].keys()),
            {'id', 'username', 'user_role', 'is_superuser'}
        )
