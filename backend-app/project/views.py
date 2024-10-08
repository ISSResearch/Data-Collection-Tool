from rest_framework.views import Response, APIView, Request
from rest_framework.permissions import IsAuthenticated
from .permissions import (
    ProjectsPermission,
    ProjectPermission,
    ProjectViewPermission,
    ProjectGoalPermission
)
from .services import ViewSetServices, GoalViewServices


class ProjectsViewSet(APIView, ViewSetServices):
    http_method_names = ("post", "get")
    permission_classes = (IsAuthenticated, ProjectsPermission)

    def get(self, request: Request) -> Response:
        return Response(self._get_available_projects(request.user).data)

    def post(self, request: Request) -> Response:
        response, status = self._create_project(request.data)
        return Response(response, status=status)


class ProjectViewSet(APIView, ViewSetServices):
    http_method_names = ("get", "patch", "delete")
    permission_classes = (IsAuthenticated, ProjectPermission, ProjectViewPermission)

    def get(self, request: Request, pk: int) -> Response:
        response, status = self._get_project(pk, request)
        return Response(response, status=status)

    def patch(self, request: Request, pk: int) -> Response:
        response, status = self._patch_project(pk, request.data)
        return Response(response, status=status)

    def delete(self, request: Request, pk: int) -> Response:
        response, status = self._delete_project(pk, request.data)
        return Response(response, status=status)


class GoalViewSet(APIView, GoalViewServices):
    http_method_names = ("get", "post", "delete")
    permission_classes = (IsAuthenticated, ProjectPermission, ProjectGoalPermission)

    def get(self, request: Request, pk: int) -> Response:
        response, status = self._get_goals(pk, request.query_params)
        return Response(response, status=status)

    def post(self, request: Request, pk: int) -> Response:
        response, status = self._create_goal(pk, request.data)
        return Response(response, status=status)

    def delete(self, _, pk: int) -> Response:
        response, status = self._delete_goal(pk)
        return Response(response, status=status)
