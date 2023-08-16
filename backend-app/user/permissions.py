from rest_framework.permissions import BasePermission


class UserPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser: return True

        project_id = view.kwargs['projectID']
        method = request.method

        if method in {'GET', 'PATCH'}:
            return bool(request.user.project_edit.filter(id=project_id))
