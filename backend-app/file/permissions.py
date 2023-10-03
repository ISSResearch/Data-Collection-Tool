from rest_framework.permissions import BasePermission
from rest_framework.views import Request, APIView
from .models import File


class FilePermission(BasePermission):
    def has_permission(self, request: Request, view: APIView) -> bool | None:
        if request.user.is_superuser: return True

        method: str = request.method

        try:
            file_id = view.kwargs.get("fileID")

            if file_id: project_id = File.objects.get(id=file_id).project_id
            else: project_id = view.kwargs["projectID"]

            if method in {"GET"}:
                return bool(request.user.project_view.filter(id=project_id))

            if method in {"PATCH"}:
                return bool(request.user.project_validate.filter(id=project_id))

            if method in {"POST", "DELETE"}:
                return bool(request.user.project_upload.filter(id=project_id))

        except File.DoesNotExist: return False
