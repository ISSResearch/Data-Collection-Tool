from django.test import TestCase
from .mock_user import MOCK_COLLECTOR_DATA
from user.forms import CreateUserForm


class CustomUserFormTest(TestCase):
    def test_create_valid_user_with_form(self):
        mock_morf = {
            **MOCK_COLLECTOR_DATA,
            'username': MOCK_COLLECTOR_DATA['username'] + 'form'
        }

        new_form = CreateUserForm({
            'username': mock_morf['username'],
            'password1': mock_morf['password'],
            'password2': mock_morf['password'],
        })

        is_valid = new_form.is_valid()
        if is_valid: new_form.save()

        self.assertEqual(new_form.instance.username, mock_morf['username'])

    def test_create_invalid_user_with_form(self):
        invalid_1 = CreateUserForm({
            'username': 'invalid-from-1',
            'password1': 'qweasd',
            'password2': 'qweasd',
        })
        invalid_2 = CreateUserForm({
            'username': 'invalid-from-2',
            'password1': 'QwE1@asdZ45',
            'password2': 'qweasd',
        })
        invalid_3 = CreateUserForm({
            'username': 'invalid-from-3',
            'password1': 'QwE1@asdZ45',
            'password2': '',
        })
        invalid_4 = CreateUserForm({
            'username': 'invalid-from-4',
            'password1': 'QwE1@a4',
            'password2': 'QwE1@a4',
        })

        self.assertIs(invalid_1.is_valid(), False)
        self.assertIs(invalid_2.is_valid(), False)
        self.assertIs(invalid_3.is_valid(), False)
        self.assertIs(invalid_4.is_valid(), False)
