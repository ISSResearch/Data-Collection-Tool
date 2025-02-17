from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_202_ACCEPTED
)
from django.conf import settings
from rest_framework.views import Request
from django.db.models.aggregates import Count
from typing import Any
from project.models import Project
from api.mixins import with_model_assertion
from requests import post
from .serializers import ArchiveSerializer
from file.serializers import FileSerializer
from file.services import ViewSetServices as FileService
from django.db import transaction


@with_model_assertion(Project, "id", filter={"visible": True}, class_based=False)
def _get_archives(project: Project) -> tuple[dict[str, Any], int]:
    query = project.archive_set \
        .annotate(file_count=Count("file")) \
        .order_by("-create_date")
    return ArchiveSerializer(query, many=True).data, HTTP_200_OK


@with_model_assertion(Project, "id", filter={"visible": True}, class_based=False)
def _make_archive(project: Project, request: Request) -> tuple[dict[str, Any], int]:
    try:
        request_query = type(
            "query",
            (object,),
            {
                "get": lambda *a: request.data.get(a[0], a[1] if len(a) > 1 else None),
                "getlist": lambda *a: request.data.get(a[0], a[1] if len(a) > 1 else []),
            }
        )

        attributes = project.attribute_set \
            .filter(id__in=request_query.get("attr", [])) \
            .order_by("level__order", "id") \
            .only("name") \
            .values_list("name", flat=True)

        only_new = request_query.get("only_new", False) is True
        only_annotation = request_query.get("only_annotation", False) is True

        filter_data = {
            "status": request_query.get("card", []),
            "only_new": only_new,
            "type": request_query.get("type", []),
            "attributes": list(attributes)
        }

        files, _ = FileService()._get_files(project.id, request.user, request_query, True)
        if only_new: files = files.filter(archive__isnull=True)

        annotation = FileSerializer(files, many=True).data

        if only_annotation: return annotation, HTTP_200_OK

        response = post(
            settings.APP_STORAGE_URL + f"/api/task/archive/{project.id}/",
            headers={
                "Authorization": "Bearer " + request.user._make_token(),
                "Content-Type": "application/json",
            },
            json=annotation
        )

        assert response.status_code == 201, response.json()
        assert (task_id := response.json().get("task_id"))

        with transaction.atomic():
            archive = project.archive_set.create(
                id=task_id,
                filters=filter_data,
                author=request.user
            )

            archive.file.add(*files)

        return {"ok": True}, HTTP_201_CREATED

    except Exception as e: return {"ok": False, "error": str(e)}, HTTP_400_BAD_REQUEST


@with_model_assertion(Project, "id", filter={"visible": True}, class_based=False)
def _patch_archive(project: Project, pk: str, data: dict[str, Any]) -> tuple[dict, int]:
    try:
        archive = project.archive_set.get(id=pk)

        archive.status = "f" if (error := data.get("error")) else "s"

        if error: archive.result_message = error
        else:
            archive.result_id = data.get("zip_id")
            archive.result_size = data.get("size", 0)

        archive.save()

        return {"ok": True}, HTTP_202_ACCEPTED
    except Exception: return {"ok": False}, HTTP_400_BAD_REQUEST
