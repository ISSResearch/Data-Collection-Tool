from django.urls import path
from .views import LevelsViewSet, AttributesViewSet

urlpatterns = (
    path('levels/', LevelsViewSet.as_view()),
    path('levels/<int:levelID>/', LevelsViewSet.as_view()),
    path('attributes/', AttributesViewSet.as_view()),
    path('attributes/<int:attributeID>/', AttributesViewSet.as_view()),
)
