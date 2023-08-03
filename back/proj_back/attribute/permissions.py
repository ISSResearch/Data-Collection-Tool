from rest_framework.permissions import BasePermission


class LevelPermission(BasePermission):
    def has_permission(self, request, _):
        method = request.method
        permission_map = {
            'GET': 'level.view_level',
            'DELETE': 'level.delete_level',
        }
        return request.user.has_perm(permission_map.get(method, False))


class AttributePermission(BasePermission):
    def has_permission(self, request, _):
        method = request.method
        permission_map = {
            'GET': 'attribute.view_attribute',
            'DELETE': 'attribute.delete_attribute',
        }
        return request.user.has_perm(permission_map.get(method, False))
