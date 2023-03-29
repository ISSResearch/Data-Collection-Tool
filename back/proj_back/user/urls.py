from django.urls import path
from .views import User, create_user, check_user, logout_user, login_user

urlpatterns = [
    path('login/', login_user),
    path('logout/', logout_user),
    path('check/', check_user),
    path('create/', create_user),
    # path('<int:user_id>/', User.as_view()),
]
