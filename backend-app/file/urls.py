from django.urls import path
from .views import FileViewSet, FilesViewSet, get_stats

urlpatterns = (
    path('project/<int:projectID>/', FilesViewSet.as_view()),
    path('<int:fileID>/', FileViewSet.as_view()),
    path('stats/project/<int:projectID>/', get_stats),
)
