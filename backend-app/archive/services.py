from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_202_ACCEPTED
)
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


@with_model_assertion(Project, "id", filter={"visible": True},)
def _get_archives(project: Project) -> tuple[dict[str, Any], int]:
    query = project.archive_set \
        .annotate(file_count=Count("file")) \
        .order_by("create_date")
    return ArchiveSerializer(query, many=True).data, HTTP_200_OK


@with_model_assertion(Project, "id", filter={"visible": True}, class_based=False)
def _make_archive(project: Project, request: Request) -> tuple[dict[str, Any], int]:
    request_data: dict[str, Any] = request.data

    attributes = project.attribute_set \
        .filter(id__in=request_data.get("attr", [])) \
        .order_by("level__order", "id") \
        .values("name") \
        .values_list("name", flat=True)

    filter_data = {
        "status": request_data.get("card", []),
        "only_new": request_data.get("downloaded", False),
        "type": request_data.get("type", []),
        "attributes": list(attributes)
    }

    files, _ = FileService()._get_files(project.id, request.user, request_data, True)

    response = post(
        "url",
        headers={
            "Authorization": "Bearer " + request.user._make_token(),
            "Content-Type": "application/json",
        },
        json=FileSerializer(files, many=True).data
    )

    assert response.status_code == 201
    assert (task_id := response.json().get("task_id"))

    with transaction.atomic():
        archive = project.archive_set.create(
            id=task_id,
            filters=filter_data,
            author=request.user
        )

        files.update(is_downloaded=True)
        archive.add(*files)

    return ArchiveSerializer(archive).data, 201
