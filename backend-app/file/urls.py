from django.urls import path
from .views import (
    FileViewSet,
    FilesViewSet,
    get_user_stats,
    get_attribute_stats,
    export_stats,
    get_duplicates
)

urlpatterns: tuple = (
    path("project/<int:projectID>/", FilesViewSet.as_view()),
    path("stats/attribute/<int:projectID>/", get_attribute_stats),
    path("stats/user/<int:projectID>/", get_user_stats),
    path("stats/export/", export_stats),
    path("duplicates/<str:fileID>/", get_duplicates),
    path("<str:fileID>/", FileViewSet.as_view()),
)
