from rest_framework.permissions import IsAuthenticated
from .permissions import LevelPermission, AttributePermission
from .serializers import Level, Attribute
from .services import ViewMixIn


class LevelsViewSet(ViewMixIn):
    permission_classes = (IsAuthenticated, LevelPermission)
    model = Level


class AttributesViewSet(ViewMixIn):
    permission_classes = (IsAuthenticated, AttributePermission)
    model = Attribute
