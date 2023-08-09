from .models import CustomUser


def set_user_permissions(data, projectID):
    change_users = data.get('users', ())

    for _user in change_users:
        try:
            user = CustomUser.objects.get(id=_user['user_id'])
            user.update_permissions(_user['permissions'], projectID)

        except CustomUser.DoesNotExist:
            ...
