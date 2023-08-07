from user.models import CustomUser
MOCK_ADMIN_DATA = {
    'username': 'TestAdmin',
    'password': 'Q!werty123ZasdAqwe',
    'is_superuser': True,
    'is_staff': True
}

MOCK_COLLECTOR_DATA = {
    'username': 'TestCollector',
    'password': 'Q!werty123ZasdAqwe',
}


class MOCK_CLASS:
    base_api = '/api/users/'
    login_endpoint = base_api + 'login/'
    logout_endpoint = base_api + 'logout/'
    check_endpoint = base_api + 'check/'
    create_endpoint = base_api + 'create/'

    def check_login(self):
        response = self.client.get(self.check_endpoint)
        status, isAuth = response.status_code, response.data.get('isAuth')

        return status, isAuth

    @classmethod
    def create_admin_user(cls, login_client=None):
        user = CustomUser.objects.create(
            username=MOCK_ADMIN_DATA['username'],
            password=MOCK_ADMIN_DATA['password'],
            is_superuser=MOCK_ADMIN_DATA['is_superuser']
        )

        return user if not login_client else login_client.force_login(user)
