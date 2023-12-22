from rest_framework.views import Request
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_202_ACCEPTED
)
from django.db.models import QuerySet
from typing import Any
from user.models import CustomUser
from .serializers import ProjectSerializer, Project, ProjectsSerializer


class ViewSetServices:
    project_prefetch = (
        "user_upload",
        "user_validate",
        "user_stats",
        "user_download",
        "user_edit"
    )

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

        if valid := new_project.is_valid():
            new_project.save()
            new_project.add_attributes()

        response_data: dict[str, Any] = {"ok": valid}

        if not valid: response_data["errors"] = new_project.errors

        return (
            response_data,
            HTTP_201_CREATED if valid else HTTP_400_BAD_REQUEST
        )

    def _get_project(
        self,
        pk: int,
        request: Request
    ) -> tuple[dict[str, Any], int]:
        response: dict[str, Any] = {}
        status: int = HTTP_200_OK

        try:
            project = Project.objects \
                .prefetch_related(*self.project_prefetch) \
                .filter(visible=True).get(id=pk)
            response = ProjectSerializer(project, context={"request": request}).data

        except Project.DoesNotExist:
            response["message"] = "query project does not exist"
            status = HTTP_404_NOT_FOUND

        return response, status

    def _patch_project(
        self,
        pk: int,
        request_data: dict[str, Any]
    ) -> tuple[dict[str, Any], int]:
        project: Project = Project.objects \
            .prefetch_related("attribute_set") \
            .get(id=pk)

        updated: ProjectSerializer = ProjectSerializer(
            project,
            data=request_data,
            partial=True
        )

        if valid := updated.is_valid():
            updated.save()
            updated.add_attributes()

        response: dict[str, Any] = {'ok': valid}

        if not valid: response['errors'] = updated.errors

        return (
            response,
            HTTP_202_ACCEPTED if valid else HTTP_400_BAD_REQUEST
        )

    def _delete_project(
        self,
        pk: int,
        request_data: dict[str, Any]
    ) -> tuple[dict[str, Any], int]:
        response: dict[str, Any] = {}
        status: int = HTTP_200_OK

        try:
            project: Project = Project.objects.filter(visible=True).get(id=pk)

            if request_data.get('approval') == project.name:
                project.visible = False
                project.save()
                response["deleted"] = True

            else:
                response["message"] = 'approval text differs from the actual name'
                status = HTTP_400_BAD_REQUEST

        except Project.DoesNotExist:
            response["message"] = 'query project does not exist'
            status = HTTP_404_NOT_FOUND

        return response, status
