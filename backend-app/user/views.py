from rest_framework.views import Response, APIView, Request
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import QuerySet
from .serializers import CollectorSerializer, CustomUser
from .permissions import UserPermission
from .services import (
    _set_user_permissions,
    _proceed_create,
    _proceed_login,
    _get_collectors
)


@api_view(("GET",))
@permission_classes(())
def check_user(request: Request) -> Response:
    return Response({"isAuth": request.user.is_authenticated})


@api_view(("POST",))
@permission_classes(())
@authentication_classes(())
def login_user(request: Request) -> Response:
    return Response(
        _proceed_login(request.data)
        if not request.user.is_authenticated
        else "already logged"
    )


@api_view(("POST",))
@permission_classes(())
@authentication_classes(())
def create_user(request: Request) -> Response:
    return Response(_proceed_create(request.data))


class CollectorsViewSet(APIView):
    http_method_names = ("get", "patch")
    permission_classes = (IsAuthenticated, UserPermission)

    def get(self, _, projectID: int) -> Response:
        return Response(_get_collectors(projectID, True).data)

    def patch(self, request: Request, projectID: int) -> Response:
        _set_user_permissions(request.data, projectID)
        return Response(_get_collectors(projectID, True).data)
