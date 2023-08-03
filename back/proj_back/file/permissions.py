from rest_framework.permissions import BasePermission


class FilePermission(BasePermission):
    def has_permission(self, request, _):
        method = request.method
        permission_map = {
            'GET': 'file.view_file',
            'POST': 'file.add_file',
            'PATCH': 'file.change_file',
            'DELETE': 'file.delete_file',
        }
        return request.user.has_perm(permission_map.get(method, False))
