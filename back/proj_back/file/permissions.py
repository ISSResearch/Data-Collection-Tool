from rest_framework.permissions import BasePermission


class FilePermission(BasePermission):
    def has_permission(self, request, _):
        method = request.method
        permission_map = {
            'GET': 'project.can_validate_project',
            'POST': 'project.can_upload_project',
            'PATCH': 'project.can_validate_project',
            'DELETE': 'project.can_upload_project',
        }
        return request.user.has_perm(permission_map.get(method, False))
