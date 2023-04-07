from django.urls import path
from .views import FileViewSet, FilesViewSet, download_project_data

urlpatterns = [
    path('project/<int:projectID>/', FilesViewSet.as_view()),
    path('download/project/<int:projectID>/', download_project_data),
    path('<int:fileID>/', FileViewSet.as_view()),
]
