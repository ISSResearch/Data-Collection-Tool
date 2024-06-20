from rest_framework.status import (
    HTTP_404_NOT_FOUND,
    HTTP_403_FORBIDDEN,
    HTTP_200_OK,
    HTTP_202_ACCEPTED,
    HTTP_206_PARTIAL_CONTENT
)
from rest_framework.views import Request, Response, APIView
from django.db import transaction, IntegrityError
from typing import Any
from file.models import File
from .models import Level, Attribute


class ViewMixIn(APIView):
    http_method_names: tuple = ("get", "delete")
    permission_classes: tuple
    model: Level | Attribute

    def get(self, request: Request, item_id: int) -> Response:
        response, status = self._can_delete_response(item_id)
        return Response(response, status=status)

    def delete(self, request: Request) -> Response:
        response, status = self._delete_items(request.data)
        return Response(response, status=status)

    def _can_delete_response(self, item_id: int) -> tuple[dict[str, Any], int]:
        try:
            query: dict[str, int] = {"uid" if self.model is Level else "id": item_id}
            delete_item: Level | Attribute = self.model.objects.get(**query)

            if not self._check_intersection(delete_item):
                return {"is_safe": True}, HTTP_200_OK

            return {
                "is_safe": False,
                "message": "attribute violation"
            }, HTTP_403_FORBIDDEN

        except self.model.DoesNotExist:
            return {
                "is_safe": False,
                "message": "queried id does not exist"
            }, HTTP_404_NOT_FOUND

    def _delete_items(self, request_data: dict[str, Any]) -> tuple[dict[int, Any], int]:
        delete_id_set: list[int] = request_data.get("id_set", [])
        response: dict[int, Any] = {}
        status: int = HTTP_202_ACCEPTED

        for delete_id in delete_id_set:
            try:
                result = self._perform_delete(delete_id)
                response[delete_id] = result or "attribute violation"
                if not result: status = HTTP_206_PARTIAL_CONTENT

            except self.model.DoesNotExist:
                response[delete_id] = "queried id does not exist"
                status = HTTP_206_PARTIAL_CONTENT

        return response, status

    def _perform_delete(self, id: int) -> bool:
        query: dict[str, int] = {"uid" if self.model is Level else "id": id}
        delete_item: Level | Attribute = self.model.objects.get(**query)

        if self._check_intersection(delete_item): return False

        try:
            with transaction.atomic():
                if isinstance(delete_item, Level):
                    for child_level in delete_item.descendants().reverse():
                        child_level.attribute_set.all().delete()
                        child_level.delete()

                    delete_item.attribute_set.all().delete()

                else: delete_item.descendants().delete()

                delete_item.delete()

        except IntegrityError: return False

        return True

    def _check_intersection(self, item: Level | Attribute) -> bool:
        file_attributes: set[int] = set(
            File.objects
            .filter(project_id=item.project_id)
            .values_list("attributegroup__attribute", flat=True)
        )

        delete_ids: set[int] = set(
            item.descendants().reverse().values_list("attribute", flat=True)
            if isinstance(item, Level) else
            item.descendants().values_list("id", flat=True)
        )

        if isinstance(item, Level):
            delete_ids = delete_ids.union(
                item.attribute_set.values_list("id", flat=True)
            )

        else: delete_ids.add(item.id)

        return bool(file_attributes.intersection(delete_ids))
