from django.test import TestCase
from jose import JWTError
from user.models import CustomUser


class CustomAuthentication:
    ALLOWED_TYPES: set[str] = {"Bearer", "Internal"}

    def authenticate(self, request):
        token: tuple[str, bool] | None = self._parse_token(
            request.META.get("HTTP_AUTHORIZATION", "")
        )

        if not token: raise ValueError("corrupted token")

        try:
            request_token, is_internal = token

            user: CustomUser = (
                CustomUser(is_superuser=True, token=request_token)
                if is_internal else
                CustomUser.objects.get(token=request_token)
            )

            user.validate_token()

        except CustomUser.DoesNotExist: raise ValueError("failed uthentication")

        except JWTError: raise ValueError("token expired")

        return (user, None)

    def _parse_token(self, token: str) -> tuple[str, bool] | None:
        if not token: return

        token_type, token_data = token.split(' ')

        if token_type in self.ALLOWED_TYPES and token_data != "null":
            return token_data, token_type == "Internal"


class _Request:
    def __init__(self, token, internal=False):
        self.META = {}
        if token: self.META["HTTP_AUTHORIZATION"] = (
            "Internal " if internal else "Bearer "
            + token
        )


class AuthenticationTest(TestCase):
    def setUp(self):
        self.user = CustomUser.objects.create(username="name", password="pass")
        self.auth = CustomAuthentication()

        self.user.emit_token()

    def test_parse_token(self):
        token = "wqeXqwes123*4123"
        external_parse = self.auth._parse_token("Bearer " + token)
        internal_parse = self.auth._parse_token("Internal " + token)

        self.assertIsNone(self.auth._parse_token(""))
        self.assertIsNone(self.auth._parse_token("Some: " + token))

        self.assertIsNotNone(external_parse)
        self.assertIsNotNone(internal_parse)

        self.assertEqual(external_parse[0], token)
        self.assertEqual(internal_parse[0], token)

        self.assertFalse(external_parse[1])
        self.assertTrue(internal_parse[1])

    def test_invalid_request(self):
        self.user.emit_token()

        try: self.auth.authenticate(_Request(""))
        except Exception as e: self.assertEqual(e.args[0], "corrupted token")

        try: self.auth.authenticate(_Request("asdzxc"))
        except Exception as e: self.assertEqual(e.args[0], "failed uthentication")

        try: self.auth.authenticate(_Request("asd", True))
        except Exception as e: self.assertEqual(e.args[0], "token expired")
