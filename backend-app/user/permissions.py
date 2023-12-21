from rest_framework.permissions import BasePermission
from rest_framework.views import Request, APIView


class UserPermission(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool | None:
        if request.user.is_superuser: return True

        project_id: int = view.kwargs["projectID"]
        method: str = request.method

        checkup: list[bool] = [bool(request.user.project_edit.filter(id=project_id))]

        if method == "PATCH": return any(checkup)

        if method == "GET":
            checkup.append(bool(request.user.project_view.filter(id=project_id)))
            return any(checkup)
