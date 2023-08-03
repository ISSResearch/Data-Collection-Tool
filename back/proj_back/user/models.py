from django.contrib.auth.models import AbstractUser
from django.contrib.auth.models import Permission
from django.contrib.contenttypes.models import ContentType
from project.models import Project


class CustomUser(AbstractUser):
    class Meta:
        db_table = 'user'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self): return self.username

    def update_permissions(self, permissions, project_id=None):
        new_permissions = {
            self._get_permission(permission)
            for permission, have_permission in permissions.items()
            if permission != 'view' and have_permission
        }
        self.user_permissions.set(new_permissions)

        can_view_project = permissions['view']
        if can_view_project: self.project_set.add(int(project_id))
        else: self.project_set.remove(int(project_id))

    def _get_permission(self, permission):
        code_name_map = {
            'upload': 'can_upload_project',
            'validate': 'can_validate_project',
            'stats': 'can_view_stats_project',
            'download': 'can_download_project',
            'edit': 'change_project',
        }

        return Permission.objects.get(
            codename=code_name_map[permission],
            content_type=ContentType.objects.get_for_model(Project)
        )
# TODO: changed - revise tests