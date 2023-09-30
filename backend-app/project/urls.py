from django.urls import path
from .views import ProjectsViewSet, ProjectViewSet

urlpatterns: tuple = (
    path("", ProjectsViewSet.as_view()),
    path("<int:pk>/", ProjectViewSet.as_view())
)
