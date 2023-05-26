from django.urls import path
from .views import LevelViewSet, AttributeViewSet

urlpatterns = [
    path('level/<int:levelID>/', LevelViewSet.as_view()),
    path('attribute/<int:attributeID>/', AttributeViewSet.as_view()),
]