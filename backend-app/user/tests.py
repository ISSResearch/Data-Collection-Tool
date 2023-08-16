from .user_tests.models_test import CustomUserModelTest
from .user_tests.forms_test import CustomUserFormTest
from .user_tests.serializers_test import CustomUserSerializerTest, CollectorTest
from .user_tests.services_test import SetUserPermissionTest
from .user_tests.permissions_test import UserPermissionTest
from .user_tests.views_test import (
    UserLoginViewTest,
    UserLogoutViewsTest,
    UserCheckViewTest,
    UserCreateViewTest,
)
