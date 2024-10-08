from django.contrib.auth import authenticate
from django.db.models import QuerySet
from typing import Any
from .serializers import CollectorSerializer, UserSerializer
from .forms import CustomUser, CreateUserForm


def _proceed_create(request_data: dict[str, Any]) -> tuple[dict[str, Any], int]:
    form: CreateUserForm = CreateUserForm(request_data)

    if is_valid := form.is_valid(): form.save()

    response: dict[str, Any] = {"isAuth": is_valid}

    if is_valid:
        response["accessToken"] = form.instance.emit_token()
        response["user"] = UserSerializer(form.instance).data
    else: response["errors"] = form.errors

    return response, 201 if is_valid else 200


def _proceed_login(request_data: dict[str, Any]) -> dict[str, Any]:
    response: dict[str, Any] = {"isAuth": False}

    if user := authenticate(
        username=request_data.get("username", ""),
        password=request_data.get("password", "")
    ):
        response["accessToken"] = user.emit_token()
        response["isAuth"] = True
        response["user"] = UserSerializer(user).data

    else: response["message"] = "No user found or wrong credentials"

    return response


def _get_collectors(
    project_id: int,
    serialized: bool = False
) -> QuerySet | CollectorSerializer:
    collectors: QuerySet = CustomUser.objects \
        .prefetch_related(
            "project_view",
            "project_upload",
            "project_validate",
            "project_stats",
            "project_download",
            "project_edit"
        ) \
        .order_by("username")

    return (
        collectors if not serialized
        else CollectorSerializer(
            collectors,
            many=True,
            context={"project_id": project_id}
        )
    )


def _set_user_permissions(data, projectID: int) -> None:
    change_users: tuple[dict[str, Any]] = data.get("users", ())

    for _user in change_users:
        try:
            user: CustomUser = CustomUser.objects.get(id=_user["user_id"])
            user.update_permissions(_user["permissions"], projectID)

        except CustomUser.DoesNotExist: pass
