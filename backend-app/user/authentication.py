from rest_framework.authentication import BaseAuthentication
from rest_framework.views import Request
from rest_framework.exceptions import AuthenticationFailed
from user.models import CustomUser


class CustomAuthentication(BaseAuthentication):
    def authenticate(self, request: Request) -> tuple[CustomUser, None]:
        request_token: str | None = self._parse_token(
            request.META.get('HTTP_AUTHORIZATION', "")
        )

        if not request_token: raise AuthenticationFailed('corrupted token')

        try:
            user: CustomUser = CustomUser.objects \
            .get(token=request_token)

            if not user.validate_token():
                raise AuthenticationFailed('failed uthentication')

        except CustomUser.DoesNotExist:
            raise AuthenticationFailed('failed uthentication')

        return (user, None)

    def _parse_token(self, token: str) -> str | None:
        if not token: return

        token_type, token_data = token.split(" ")

        if token_type == "Bearer" and token_data != "null": return token_data
