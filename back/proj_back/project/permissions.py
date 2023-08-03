from rest_framework.permissions import BasePermission


class ProjectPermission(BasePermission):
    def has_permission(self, request, _):
        method = request.method

        if method == 'GET': return True

        permission_map = {
            'POST': 'project.add_project',
            'PATCH': 'project.change_project',
            'DELETE': 'project.delete_project',
        }
        return request.user.has_perm(permission_map.get(method, False))


class ProjectViewPermission(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser or bool(
            request.user.project_set.filter(id=view.kwargs['pk'])
        )


class ProjetcStatsPermission(BasePermission):
    def has_permission(self, request, _):
        return request.user.has_perm('project.can_view_stats_project')


class ProjetcDownloadPermission(BasePermission):
    def has_permission(self, request, _):
        return request.user.has_perm('project.can_download_project')
