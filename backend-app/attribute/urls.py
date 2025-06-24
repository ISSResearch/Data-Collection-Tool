from django.urls import path
from .views import LevelsViewSet, AttributesViewSet, attribute_diff

urlpatterns = (
    path("levels/", LevelsViewSet.as_view()),
    path("levels/<int:item_id>/", LevelsViewSet.as_view()),
    path("attributes/", AttributesViewSet.as_view()),
    path("attributes/diff/<int:projectID>/", attribute_diff),
    path("attributes/<int:item_id>/", AttributesViewSet.as_view()),
)
