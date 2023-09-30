from rest_framework.views import Response, APIView, Request
from rest_framework.permissions import IsAuthenticated
from .permissions import ProjectsPermission, ProjectPermission, ProjectViewPermission
from .services import ViewSetServices


class ProjectsViewSet(APIView, ViewSetServices):
    http_method_names = ("post", "get")
    permission_classes = (IsAuthenticated, ProjectsPermission)

    def get(self, request: Request) -> Response:
        return Response(self._get_available_projects(request.user).data)

    def post(self, request: Request) -> Response :
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
