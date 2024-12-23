from rest_framework.views import Response, APIView, Request
from rest_framework.permissions import IsAuthenticated
from .permissions import ArchivesPermission
from user.permissions import InternalPermission
from .services import _get_archives, _make_archive, _patch_archive


class ArchivesViewSet(APIView):
    http_method_names = ("post", "get")
    permission_classes = (IsAuthenticated, ArchivesPermission)

    def get(self, request: Request, p_pk: int) -> Response:
        response, status = _get_archives(p_pk)
        return Response(response, status=status)

    def post(self, request: Request, p_pk: int) -> Response:
        response, status = _make_archive(p_pk, request)
        return Response(response, status=status)


class ArchiveViewSet(APIView):
    http_method_names = ("get", "patch")
    permission_classes = (IsAuthenticated, InternalPermission)

    def patch(self, request: Request, p_pk: int, pk: str) -> Response:
        response, status = _patch_archive(p_pk, pk, request.data)
        return Response(response, status=status)
