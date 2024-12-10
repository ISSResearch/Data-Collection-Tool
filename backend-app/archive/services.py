from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_202_ACCEPTED
)
from django.db.models.aggregates import Count
from typing import Any
from project.models import Project
from api.mixins import with_model_assertion
from .serializers import ArchiveSerializer


@with_model_assertion(Project, "id", filter={"visible": True},)
def _get_archives(project: Project) -> tuple[dict[str, Any], int]:
    query = project.archive_set \
        .annotate(file_count=Count("file")) \
        .order_by("create_date")
    return ArchiveSerializer(query, many=True).data, HTTP_200_OK


@with_model_assertion(Project, "id", filter={"visible": True})
def _make_archive(
    project: Project,
    request_data: dict[str, Any]
) -> tuple[dict[str, Any], int]:
    ...
#     response: dict[str, Any]
#     status: int

#     try:
#         attribute = project.attribute_set.get(id=request_data["attribute_id"])

#         assert not attribute.projectgoal_set.count(), "Goal for Attribute already exists"

#         goal_attribute_names = [
#             f"{name} ({level_name})"
#             for name, level_name in
#             attribute
#             .ancestors(include_self=True)
#             .values_list("name", "level__name")
#         ]

#         project.projectgoal_set.create(
#             attribute=attribute,
#             amount=int(request_data["amount"]),
#             name=" > ".join(goal_attribute_names),
#             image_mod=int(request_data.get("image_mod", 1)),
#             video_mod=int(request_data.get("video_mod", 1)),
#         )

#         response, status = {"ok": True}, HTTP_201_CREATED

#     except AssertionError as e:
#         if int(request_data.get("update", 0)) == 1:
#             goal = attribute.projectgoal_set.first()
#             goal.amount = int(request_data["amount"])
#             goal.image_mod = int(request_data.get("image_mod", 1))
#             goal.video_mod = int(request_data.get("video_mod", 1))
#             goal.save()

#             response, status = {"ok": True}, HTTP_202_ACCEPTED

#         else: response, status = {"errors": str(e)}, HTTP_400_BAD_REQUEST

#     except Exception as e: response, status = {"errors": str(e)}, HTTP_400_BAD_REQUEST

#     return response, status

# @with_model_assertion(ProjectGoal, "id")
# def _delete_goal(self, goal: ProjectGoal):
#     try:
#         goal.delete()
#         return {"ok": True}, HTTP_202_ACCEPTED

#     except Exception as e: return {"errors": str(e)}, HTTP_400_BAD_REQUEST
