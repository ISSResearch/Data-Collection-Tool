from rest_framework.status import HTTP_400_BAD_REQUEST
from rest_framework.views import Response, APIView, Request
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from project.permissions import ProjectStatsPermission
from user.permissions import InternalPermission
from django.http.response import FileResponse
from .permissions import FilePermission
from .services import ViewSetServices, StatsServices, _annotate_files, form_export_file


class FileViewSet(APIView, ViewSetServices):
    http_method_names = ("patch", "delete")
    permission_classes = (IsAuthenticated, FilePermission)

    def patch(self, request: Request, fileID: str) -> Response:
        response, status = self._patch_file(fileID, request)
        return Response(response, status=status)

    def delete(self, _, fileID: str) -> Response:
        response, status = self._delete_file(fileID)
        return Response(response, status=status)


class FilesViewSet(APIView, ViewSetServices):
    http_method_names = ("get", "post")
    permission_classes = (IsAuthenticated, FilePermission)

    def get(self, request: Request, projectID: int) -> Response:
        response, status = self._get_files(projectID, request.user, request.query_params)
        return Response(response, status=status)

    def post(self, request: Request, projectID: int) -> Response:
        response, status = self._create_file(projectID, request)
        return Response(response, status=status)


@api_view(("GET",))
@permission_classes((IsAuthenticated, ProjectStatsPermission))
def get_attribute_stats(_, projectID: int) -> Response:
    response, status = StatsServices.from_attribute(projectID)
    return Response(response, status=status)


@api_view(("GET",))
@permission_classes((IsAuthenticated, ProjectStatsPermission))
def get_user_stats(_, projectID: int) -> Response:
    response, status = StatsServices.from_user(projectID)
    return Response(response, status=status)


@api_view(("POST",))
@permission_classes((IsAuthenticated, InternalPermission))
def get_annotation(request: Request) -> Response:
    response, status = _annotate_files(request.data)
    return Response(response, status=status)


@api_view(("GET",))
@permission_classes((IsAuthenticated, ProjectStatsPermission))
def export_stats(request: Request) -> Response | FileResponse:
    try:
        response = form_export_file(request.query_params)
        return FileResponse(response)
    except Exception as err: return Response(str(err), HTTP_400_BAD_REQUEST)
