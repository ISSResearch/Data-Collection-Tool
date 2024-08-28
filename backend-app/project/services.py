from rest_framework.views import Request
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_202_ACCEPTED
)
from django.db.models import QuerySet
from django.db import transaction
from typing import Any
from user.models import CustomUser
from .serializers import (
    ProjectSerializer,
    Project,
    ProjectsSerializer,
    GoalSerializer,
    ProjectGoal
)
from api.mixins import with_model_assertion


class ViewSetServices:
    def _get_available_projects(self, user: CustomUser) -> QuerySet:
        projects: QuerySet = Project.objects.order_by("id").filter(visible=True)

        if not user.is_superuser:
            projects = projects.filter(user_visible__id=user.id)

        return ProjectsSerializer(projects, many=True)

    def _create_project(
        self,
        request_data: dict[str, Any]
    ) -> tuple[dict[str, Any], int]:
        new_project: ProjectsSerializer = ProjectsSerializer(data=request_data)
        try:
            assert new_project.is_valid(), new_project.errors

            with transaction.atomic():
                new_project.save()
                new_project.add_attributes()

            return {"ok": True}, HTTP_201_CREATED

        except Exception as e: return {"errors": str(e)}, HTTP_400_BAD_REQUEST

    @with_model_assertion(
        Project,
        "id",
        filter={"visible": True},
        prefetch=("user_upload", "user_validate", "user_stats", "user_download", "user_edit")
    )
    def _get_project(self, project, request: Request) -> tuple[dict[str, Any], int]:
        return (
            ProjectSerializer(project, context={"request": request}).data,
            HTTP_200_OK
        )

    @with_model_assertion(Project, "id", filter={"visible": True}, prefetch=("attribute_set",))
    def _patch_project(
        self,
        project: Project,
        request_data: dict[str, Any]
    ) -> tuple[dict[str, Any], int]:
        updated = ProjectSerializer(project, data=request_data, partial=True)

        try:
            assert updated.is_valid(), updated.errors

            with transaction.atomic():
                updated.save()
                updated.add_attributes()

            return {"ok": True}, HTTP_202_ACCEPTED

        except Exception as e: return {"errors": str(e)}, HTTP_400_BAD_REQUEST

    @with_model_assertion(Project, "id", filter={"visible": True})
    def _delete_project(
        self,
        project: Project,
        request_data: dict[str, Any]
    ) -> tuple[dict[str, Any], int]:
        try:
            assert request_data.get("approval") == project.name
            project.visible = False
            project.save()

            return {"deleted": True}, HTTP_200_OK

        except AssertionError: return (
            {"message": "approval text differs from the actual name"},
            HTTP_400_BAD_REQUEST,
        )


class GoalViewServices:
    @with_model_assertion(
        Project,
        "id",
        filter={"visible": True},
        prefetch=(
            "projectgoal_set__attribute__level",
            "projectgoal_set__attribute__attributegroup_set",
        )
    )
    def _get_goals(self, project: Project) -> tuple[list[dict[str, Any]], int]:
        data = GoalSerializer(project.projectgoal_set.order_by("id").all(), many=True)
        return data.data, HTTP_200_OK

    @with_model_assertion(Project, "id", filter={"visible": True})
    def _create_goal(self, project: Project, request_data: dict[str, Any]):
        try:
            attribute = project.attribute_set.get(id=request_data["attribute_id"])

            assert not attribute.projectgoal_set.count(), "Goal for Attribute already exists"

            goal_attribute_names = [
                f"{name} ({level_name})"
                for name, level_name in
                attribute
                    .ancestors(include_self=True)
                    .values_list("name", "level__name")
            ]

            project.projectgoal_set.create(
                attribute=attribute,
                amount=int(request_data["amount"]),
                name=" > ".join(goal_attribute_names)
            )

            return {"ok": True}, HTTP_201_CREATED

        except Exception as e: return {"errors": str(e)}, HTTP_400_BAD_REQUEST

    @with_model_assertion(ProjectGoal, "id")
    def _delete_goal(self, goal: ProjectGoal):
        try:
            goal.delete()
            return {"ok": True}, HTTP_202_ACCEPTED

        except Exception as e: return {"errors": str(e)}, HTTP_400_BAD_REQUEST
