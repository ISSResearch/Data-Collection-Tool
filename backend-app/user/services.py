from .forms import CustomUser, CreateUserForm
from typing import Any
from django.contrib.auth import authenticate


def _set_user_permissions(data, projectID: int) -> None:
    change_users: tuple[dict[str, Any]] = data.get('users', ())

    for _user in change_users:
        try:
            user: CustomUser = CustomUser.objects.get(id=_user['user_id'])
            user.update_permissions(_user['permissions'], projectID)

        except CustomUser.DoesNotExist: pass


def _proceed_create(request_data: dict[str, Any]) -> dict[str, Any]:
    form: CreateUserForm = CreateUserForm(request_data)

    is_valid: bool = form.is_valid()
    if is_valid: form.save()

    response: dict[str, Any] = {'isAuth': is_valid}

    if is_valid: response["accessToken"] = form.instance.emit_token()
    else: response['errors'] = form.errors
    return response


def _proceed_login(request_data: dict[str, Any]) -> dict[str, Any]:
    response: dict[str, Any] = {'isAuth': False}

    user: CustomUser = authenticate(
        username=request_data.get('username', ""),
        password=request_data.get('password', "")
    )

    if user:
        response['accessToken'] = user.emit_token()
        response['isAuth'] = True
    else: response['message'] = 'No user found or wrong credentials'

    return response
