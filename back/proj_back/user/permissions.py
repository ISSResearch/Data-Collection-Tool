from rest_framework.permissions import BasePermission


class UserPermission(BasePermission):
    def has_permission(self, request, _):
        return request.user.has_perm('user.change_customuser')
