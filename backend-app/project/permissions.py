from rest_framework.permissions import BasePermission


class ProjectsPermission(BasePermission):
    def has_permission(self, request, _):
        return request.method == 'GET' or request.user.is_superuser


class ProjectPermission(BasePermission):
    def has_permission(self, request, view):
        method = request.method
        if request.user.is_superuser or method == 'GET': return True

        if method in {'PATCH', 'DELETE'}:
            return bool(request.user.project_edit.filter(id=view.kwargs['pk']))


class ProjectViewPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or bool(
            request.user.project_view.filter(id=view.kwargs['pk'])
        )


class ProjectStatsPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or bool(
            request.user.project_stats.filter(id=view.kwargs['projectID'])
        )


class ProjetcDownloadPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or bool(
            request.user.project_download.filter(id=view.kwargs['projectID'])
        )
