from user.forms import CreateUserForm

MOCK_ADMIN_DATA = {
    'username': 'TestAdmin',
    'password': 'Q!werty123ZasdAqwe',
    'user_role': 'a',
    'is_superuser': True,
    'is_staff': True
}

MOCK_COLLECTOR_DATA = {
    'username': 'TestCollector',
    'password': 'Q!werty123ZasdAqwe',
    'user_role': 'c',
}


class MOCK_ENDPOINTS():
    base_api = '/api/users/'
    login_endpoint = base_api + 'login/'
    logout_endpoint = base_api + 'logout/'
    check_endpoint = base_api + 'check/'
    create_endpoint = base_api + 'create/'

    def __init__(self):
        mock_data = {
            **MOCK_COLLECTOR_DATA,
            'username': MOCK_COLLECTOR_DATA['username'] + 'Mocked'
        }

        self.mock_user = CreateUserForm({
            'username': mock_data['username'],
            'password1': mock_data['password'],
            'password2': mock_data['password'],
        })

        is_valid = self.mock_user.is_valid()
        if is_valid: self.mock_user.save()

        self.mock_user = self.mock_user.inctance


    def check_login(self):
        response = self.client.get(self.check_endpoint)
        status, isAuth = response.status_code, response.data.get('isAuth')

        return status, isAuth
