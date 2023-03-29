from django.urls import path
from .views import FileViewSet, FilesViewSet

urlpatterns = [
    path('project/<int:projectID>/', FilesViewSet.as_view()),
    path('<int:fileID>/', FileViewSet.as_view()),
]
