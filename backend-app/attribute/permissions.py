from rest_framework.permissions import BasePermission
from rest_framework.views import Request, APIView
from typing import Any
from .models import Level, Attribute


class PermissionMixIn(BasePermission):
    model: Attribute | Level

    def has_permission(self, request: Request, view: APIView) -> bool | None:
        if request.user.is_superuser: return True

        try:
            if request.method == "GET":
                item = self.model.objects.get(**self._get_lookup(request, view))
                return bool(request.user.project_edit.filter(id=item.project_id))

            if request.method == "DELETE":
                request_project_ids: set[int] = set(
                    self.model.objects
                    .filter(**self._get_lookup(request, view))
                    .values_list("project_id", flat=True)
                )

                user_project_ids: set[int] = set(
                    request.user.project_edit.values_list("id", flat=True)
                )

                return bool(user_project_ids) and not bool(request_project_ids - user_project_ids)

        except self.model.DoesNotExist: return False

    def _get_lookup(self, request: Request, view: APIView,) -> dict[str, Any]:
        field: str = "id" if self.model == Attribute else "uid"

        return (
            {field: view.kwargs["item_id"]}
            if request.method == "GET" else
            {field + "__in": request.data.get("id_set", ())}
        )


class LevelPermission(PermissionMixIn):
    model = Level


class AttributePermission(PermissionMixIn):
    model = Attribute
