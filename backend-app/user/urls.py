from django.urls import path
from .views import create_user, check_user, login_user, CollectorsViewSet, logout_user

urlpatterns: tuple = (
    path("login/", login_user),
    path("logout/", logout_user),
    path("check/", check_user),
    path("create/", create_user),
    path("collectors/<int:projectID>/", CollectorsViewSet.as_view())
)
