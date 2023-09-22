from django.contrib.auth.models import AbstractUser
from rest_framework_simplejwt.tokens import RefreshToken
from jose import jwt
from django.conf import settings
from datetime import datetime
from typing import Any


class CustomUser(AbstractUser):
    class Meta:
        db_table = 'user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self): return self.username

    def emit_token(self) -> str:
        time_now: datetime = datetime.utcnow()
        token_settings: dict[str, Any] = settings.SIMPLE_JWT
        token_data: dict[str, Any] = {
          "token_type": "access",
          "exp": time_now + token_settings.get("ACCESS_TOKEN_LIFETIME", 1),
          "iat": time_now,
          "jti": f"emited-token-{time_now}",
          "user_id": self.id,
          "user_name": self.username,
          "is_superuser": self.is_superuser
        }

        return jwt.encode(
            token_data,
            token_settings.get("SIGNING_KEY", ""),
            algorithm=token_settings.get("ALGORITHM", "HS256")
        )

    # TODO: optimize
    def update_permissions(self, permissions, project_id):
        change_fields = (
            (self.project_visible, 'visible'),
            (self.project_view, 'view'),
            (self.project_upload, 'upload'),
            (self.project_validate, 'validate'),
            (self.project_stats, 'stats'),
            (self.project_download, 'download'),
            (self.project_edit, 'edit'),
        )

        for field, permission_name in change_fields:
            is_permission = permissions.get(permission_name)

            if is_permission: field.add(int(project_id))
            else: field.remove(int(project_id))
