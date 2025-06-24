from rest_framework.authentication import BaseAuthentication
from rest_framework.views import Request
from rest_framework.exceptions import AuthenticationFailed
from user.models import CustomUser
from jose import JWTError


class CustomAuthentication(BaseAuthentication):
    ALLOWED_TYPES: set[str] = {"Bearer", "Internal"}

    def authenticate(self, request: Request) -> tuple[CustomUser, None]:
        token: tuple[str, bool] | None = self._parse_token(
            request.META.get("HTTP_AUTHORIZATION", "")
        )

        if not token: raise AuthenticationFailed("corrupted token")

        try:
            request_token, is_internal = token

            user: CustomUser = (
                CustomUser(
                    is_superuser=True,
                    token=request_token,
                    first_name="internal",
                    last_name="app"
                )
                if is_internal else
                CustomUser.objects.get(token=request_token)
            )

            user.validate_token()

        except CustomUser.DoesNotExist:
            raise AuthenticationFailed("failed uthentication")

        except JWTError: raise AuthenticationFailed("token expired")

        return (user, None)

    def _parse_token(self, token: str) -> tuple[str, bool] | None:
        if not token: return

        token_type, token_data = token.split(' ')

        if token_type in self.ALLOWED_TYPES and token_data != "null":
            return token_data, token_type == "Internal"
