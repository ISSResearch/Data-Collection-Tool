from rest_framework.views import Response, APIView, Request
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from django.db.models import QuerySet
from .serializers import CollectorSerializer, CustomUser
from .permissions import UserPermission
from .services import _set_user_permissions, _proceed_create, _proceed_login


@api_view(('GET',))
@permission_classes(())
def check_user(request: Request) -> Response:
    return Response({'isAuth': request.user.is_authenticated})


@api_view(('POST',))
@permission_classes(())
@authentication_classes(())
def login_user(request: Request) -> Response:
    return Response(
        _proceed_login(request.data)
        if not request.user.is_authenticated
        else "already logged"
    )


@api_view(('POST',))
@permission_classes(())
@authentication_classes(())
def create_user(request: Request) -> Response:
    return Response(_proceed_create(request.data))


class CollectorsViewSet(APIView):
    http_method_names = ('get', 'patch')
    permission_classes = (IsAuthenticated, UserPermission)

    def get(self, _, projectID: int) -> Response:
        return Response(self._get_collectors(projectID, True).data)

    def patch(self, request: Request, projectID: int) -> Response:
        _set_user_permissions(request.data, projectID)
        return Response(self._get_collectors(projectID, True).data)

    def _get_collectors(
        self,
        project_id: int,
        serialized: bool = False
    ) -> QuerySet | CollectorSerializer:
        collectors: QuerySet = CustomUser.objects \
            .prefetch_related(
                'project_view',
                'project_upload',
                'project_validate',
                'project_stats',
                'project_download',
                'project_edit'
            ) \
            .filter(is_superuser=False)

        return (
            collectors if not serialized
            else CollectorSerializer(
                collectors,
                many=True,
                context={'project_id': project_id}
            )
        )
