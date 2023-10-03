from rest_framework.permissions import BasePermission
from rest_framework.views import Request, APIView
from typing import Any
from .models import Level, Attribute


class PermissionMixIn(BasePermission):
    model: Attribute | Level

    def _get_lookup(
        self,
        request: Request,
        view: APIView,
        for_get: bool
    ) -> dict[str, Any]:
        if self.model.__name__ == "Attribute":
            return (
                {"id": view.kwargs["itemID"]}
                if for_get else
                {"id__in": request.data.get("id_set", ())}
            )
        else:
            return (
                {"uid": view.kwargs["itemID"]}
                if for_get else
                {"uid__in": request.data.get("id_set", ())}
            )

    def has_permission(self, request: Request, view: APIView) -> bool | None:
        if request.user.is_superuser: return True

        try:
            if request.method == "GET":
                item = self.model.objects.get(
                    **self._get_lookup(request, view, True)
                )
                return bool(request.user.project_edit.filter(id=item.project_id))

            if request.method == "DELETE":
                request_project_ids: set[int] = set(
                    self.model.objects
                    .filter(
                        **self._get_lookup(request, view, False)
                    )
                    .values_list("project_id", flat=True)
                )

                user_project_ids: set[int] = set(
                    request.user.project_edit.values_list("id", flat=True)
                )

                return bool(
                    user_project_ids and not request_project_ids - user_project_ids
                )

        except self.model.DoesNotExist: return True


class LevelPermission(PermissionMixIn):
    model = Level


class AttributePermission(PermissionMixIn):
    model = Attribute
