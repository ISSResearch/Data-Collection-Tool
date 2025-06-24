from django.urls import path
from .views import ProjectsViewSet, ProjectViewSet, GoalViewSet
from archive.views import ArchivesViewSet, ArchiveViewSet

urlpatterns: tuple = (
    path("", ProjectsViewSet.as_view()),
    path("goals/<int:pk>/", GoalViewSet.as_view()),
    path("archive/<int:p_pk>/<str:pk>/", ArchiveViewSet.as_view()),
    path("archive/<int:p_pk>/", ArchivesViewSet.as_view()),
    path("<int:pk>/", ProjectViewSet.as_view())
)
