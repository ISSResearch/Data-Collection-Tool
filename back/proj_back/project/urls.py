from django.urls import path
from .views import ProjectsViewSet, ProjectViewSet

urlpatterns = (
    path('', ProjectsViewSet.as_view()),
    path('<int:pk>/', ProjectViewSet.as_view())
)
