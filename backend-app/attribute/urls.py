from django.urls import path
from .views import LevelsViewSet, AttributesViewSet

urlpatterns = (
    path("levels/", LevelsViewSet.as_view()),
    path("levels/<int:itemID>/", LevelsViewSet.as_view()),
    path("attributes/", AttributesViewSet.as_view()),
    path("attributes/<int:itemID>/", AttributesViewSet.as_view()),
)
