from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    class Meta:
        db_table = 'user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self): return self.username

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
