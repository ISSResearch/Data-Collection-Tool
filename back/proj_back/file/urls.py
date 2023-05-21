from django.urls import path
from .views import (
    FileViewSet,
    FilesViewSet,
    download_project_data,
    get_stats,
    upload_file_chunk
)

urlpatterns = [
    path('project/<int:projectID>/', FilesViewSet.as_view()),
    path('stats/project/<int:projectID>/', get_stats),
    path('download/project/<int:projectID>/', download_project_data),
    path('<int:fileID>/', FileViewSet.as_view()),
    path('upload/<int:fileID>/', upload_file_chunk)
]
