from rest_framework.views import Response, Request
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from project.permissions import ProjectStatsPermission
from typing import cast, Optional
from .permissions import LevelPermission, AttributePermission
from .serializers import Level, Attribute
from .services import ViewMixIn, _attribute_diff


class LevelsViewSet(ViewMixIn):
    permission_classes = (IsAuthenticated, LevelPermission)
    model = Level


class AttributesViewSet(ViewMixIn):
    permission_classes = (IsAuthenticated, AttributePermission)
    model = Attribute


@api_view(("GET",))
@permission_classes((IsAuthenticated, ProjectStatsPermission))
def attribute_diff(request: Request, projectID: int) -> Response:
    param = cast(Optional[str], request.query_params.get("diff_from"))
    response, status = _attribute_diff(projectID, param)
    return Response(response, status=status)
