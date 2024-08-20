from django.urls import path
from .views import ProjectsViewSet, ProjectViewSet, GoalViewSet

urlpatterns: tuple = (
    path("", ProjectsViewSet.as_view()),
    path("goals/<int:pk>/", GoalViewSet.as_view()),
    path("<int:pk>/", ProjectViewSet.as_view())
)
