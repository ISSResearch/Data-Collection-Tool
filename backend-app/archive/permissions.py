from rest_framework.permissions import BasePermission
from rest_framework.views import Request, APIView


class ArchivesPermission(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool | None:
        project_perm = bool(request.user.project_download.filter(id=view.kwargs["p_pk"]))
        return request.user.is_superuser or project_perm


class ArchivePermission(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool | None:
        project_perm = bool(request.user.project_download.filter(id=view.kwargs["p_pk"]))
        arch_perm = bool(request.user.archive_set.filter(id=view.kwargs["pk"]))
        return request.user.is_superuser or (project_perm and arch_perm)
