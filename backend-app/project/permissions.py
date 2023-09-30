from rest_framework.permissions import BasePermission
from rest_framework.views import Request, APIView


class ProjectsPermission(BasePermission):
    def has_permission(self, request: Request, _) -> bool:
        return request.method == "GET" or request.user.is_superuser


class ProjectPermission(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool | None:
        if request.user.is_superuser or request.method == "GET": return True

        if request.method in {"PATCH", "DELETE"}:
            return bool(request.user.project_edit.filter(id=view.kwargs["pk"]))


class ProjectViewPermission(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:
        return request.user.is_superuser or bool(
            request.user.project_visible.filter(id=view.kwargs["pk"])
        )


class ProjectStatsPermission(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool:
        return request.user.is_superuser or bool(
            request.user.project_stats.filter(id=view.kwargs["projectID"])
        )
