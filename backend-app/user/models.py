from django.contrib.auth.models import AbstractUser
from django.db.models import CharField
from django.conf import settings
from jose import jwt, JWTError
from datetime import datetime
from typing import Any


class CustomUser(AbstractUser):
    token: CharField = CharField(max_length=225, null=True)

    class Meta:
        db_table = "user"
        verbose_name = "User"
        verbose_name_plural = "Users"

    def __str__(self) -> None: return self.username

    def validate_token(self):
        token_settings: dict[str, Any] = settings.SIMPLE_JWT

        try:
            jwt.decode(
                self.token,
                token_settings.get("SIGNING_KEY", ""),
                algorithms=token_settings.get("ALGORITHM", "HS256")
            )

        except (JWTError, AttributeError):
            if self.id:
                self.token = None
                self.save()

            raise JWTError


    def emit_token(self) -> str:
        time_now: datetime = datetime.utcnow()
        token_settings: dict[str, Any] = settings.SIMPLE_JWT

        token_data: dict[str, Any] = {
            "token_type": "access",
            "exp": time_now + token_settings.get("ACCESS_TOKEN_LIFETIME", 1),
            "iat": time_now,
            "jti": f"emited-token-{time_now}",
        }

        self.token = jwt.encode(
            token_data,
            token_settings.get("SIGNING_KEY", ""),
            algorithm=token_settings.get("ALGORITHM", "HS256")
        )

        self.save()

        return self.token

    def update_permissions(self, permissions: dict[str, bool], project_id: int) -> None:
        change_fields = (
            (self.project_visible, "visible"),
            (self.project_view, "view"),
            (self.project_upload, "upload"),
            (self.project_validate, "validate"),
            (self.project_stats, "stats"),
            (self.project_download, "download"),
            (self.project_edit, "edit"),
        )

        for field, permission_name in change_fields:
            is_permission = permissions.get(permission_name)

            if is_permission: field.add(project_id)
            else: field.remove(project_id)
