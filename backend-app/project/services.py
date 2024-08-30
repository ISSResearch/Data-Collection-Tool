from rest_framework.views import Request
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_202_ACCEPTED
)
from django.core.paginator import Paginator
from django.db.models import (
    QuerySet,
    F,
    Q,
    Value,
    ExpressionWrapper,
    IntegerField,
    Case,
    When
)
from django.db.models.functions import Coalesce
from django.db.models.aggregates import Count
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
            "projectgoal_set__attribute__attributegroup_set",
            "projectgoal_set__attribute__attributegroup_set__file",
        )
    )
    def _get_goals(self, project: Project, request_query) -> tuple[dict[str, Any], int]:
        page = int(request_query.get("page", 1))
        per_page = 50

        file_count = lambda _type, status: Coalesce(
            Count(
                "attribute__attributegroup__file",
                filter=Q(
                    attribute__attributegroup__file__status=status,
                    attribute__attributegroup__file__file_type=_type
                )
            ),
            Value(0),
            output_field=IntegerField()
        )
        complete_calc = lambda _type: ExpressionWrapper(
            F(f"video_{_type}_count") * F("video_mod") + F(f"image_{_type}_count") * F("image_mod"),
            output_field=IntegerField()
        )

        query = project.projectgoal_set \
            .annotate(
                image_v_count=file_count("image", "v"),
                video_v_count=file_count("video", "v"),
                image_a_count=file_count("image", "a"),
                video_a_count=file_count("video", "a"),
                on_validation=complete_calc("v"),
                complete=complete_calc("a"),
                _progress=ExpressionWrapper(
                    F("complete") * 100 / F("amount"),
                    output_field=IntegerField()
                ),
                progress=Case(
                    When(_progress__gt=100, then=Value(100)),
                    default=F('_progress'),
                    output_field=IntegerField()
                )
            ) \
            .order_by(F("on_validation"), F("progress"), "id")

        if request_query.get("all") != "1": query = query.filter(complete__lt=F("amount"))

        paginator = Paginator(query, per_page)

        return {
            "data": GoalSerializer(
                paginator.page(page).object_list,
                many=True
            ).data,
            "page": page,
            "total_pages": paginator.num_pages
        }, HTTP_200_OK

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
                name=" > ".join(goal_attribute_names),
                image_mod=int(request_data.get("image_mod", 1)),
                video_mod=int(request_data.get("video_mod", 1)),
            )

            return {"ok": True}, HTTP_201_CREATED

        except Exception as e: return {"errors": str(e)}, HTTP_400_BAD_REQUEST

    @with_model_assertion(ProjectGoal, "id")
    def _delete_goal(self, goal: ProjectGoal):
        try:
            goal.delete()
            return {"ok": True}, HTTP_202_ACCEPTED

        except Exception as e: return {"errors": str(e)}, HTTP_400_BAD_REQUEST
