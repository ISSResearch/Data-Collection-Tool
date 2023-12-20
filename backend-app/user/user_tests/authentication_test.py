from django.test import TestCase
from user.models import CustomUser
from user.authentication import AuthenticationFailed, CustomAuthentication

class _Request:
    def __init__(self, token, internal=False):
        self.META = {}
        if token: self.META["HTTP_AUTHORIZATION"] = (
            "Internal" if internal else "Bearer"
            + ": "
            + token
        )


class AuthenticationTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create(username="name", password="pass")
        # cls.auth = CustomAuthentication()

        self.user.emit_token()

    def test_parse_token(self):
        token = "wqeXqwes123*4123"
        external_parse = self.auth._parse_token("Bearer: " + token)
        internal_parse = self.auth._parse_token("Internal: " + token)

        self.assertIsNone(self.auth._parse_token(""))
        self.assertIsNone(self.auth._parse_token("Some: " + token))

        self.assertIsNotNone(external_parse)
        self.assertIsNotNone(internal_parse)

        self.assertEqual(external_parse[0], token)
        self.assertEqual(internal_parse[0], token)

        self.assertFalse(external_parse[1])
        self.assertTrue(internal_parse[1])

    def test_invalid_request(self):
        prev_token = self.user.token
        self.user.emit_token()

        try: self.auth.authenticate(_Request(""))
        except AuthenticationFailed as e: self.assertEqual(e, "corrupted token")

        try: self.auth.authenticate(_Request("asdzxc"))
        except AuthenticationFailed as e: self.assertEqual(e, "failed uthentication")
        try: self.auth.authenticate(_Request(prev_token))
        except AuthenticationFailed as e: self.assertEqual(e, "token expired")

        try: self.auth.authenticate(_Request("asd", True))
        except AuthenticationFailed as e: self.assertEqual(e, "token expired")
