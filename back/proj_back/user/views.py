from rest_framework.views import Response, APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.http import require_GET
from django.http import JsonResponse
from .serializers import UserSerializer, CollectorSerializer
from .forms import CreateUserForm, CustomUser
from .permissions import UserPermission
from .services import set_user_permissions


@api_view(('POST',))
@permission_classes([])
def login_user(request):
    response = {'isAuth': False}

    if not request.user.is_authenticated:
        username, password = request.data.get('username'), request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            login(request, user)
            serialized_user = UserSerializer(user)
            response['user'] = serialized_user.data
            response['isAuth'] = True
        else: response['message'] = 'No user found or wrong credentials'

    return Response(response)


@require_GET
def logout_user(request):
    logout(request)
    return JsonResponse({'ok': True})


@api_view(('GET',))
@permission_classes([])
def check_user(request):
    user = request.user
    response = {'isAuth': user.is_authenticated}

    if user.is_authenticated: response['user'] = UserSerializer(user).data

    return Response(response)


@api_view(('POST',))
@permission_classes([])
def create_user(request):
    form = CreateUserForm(request.data)

    is_valid = form.is_valid()
    if is_valid: form.save()

    response = {'isAuth': is_valid}

    if is_valid: response['user'] = UserSerializer(form.instance).data
    else: response['errors'] = form.errors

    return Response(response)


class CollectorsViewSet(APIView):
    http_method_names = ('get', 'patch')
    permission_classes = (IsAuthenticated, UserPermission)

    def get(self, _, projectID):
        collectors = CustomUser.objects \
            .prefetch_related(
                'project_view',
                'project_upload',
                'project_validate',
                'project_stats',
                'project_download',
                'project_edit'
            ) \
            .filter(is_superuser=False)
        response = CollectorSerializer(collectors, many=True, context={'project_id': projectID})

        return Response(response.data)

    def patch(self, request, projectID):
        set_user_permissions(request.data, projectID)

        collectors = CustomUser.objects \
            .prefetch_related(
                'project_view',
                'project_upload',
                'project_validate',
                'project_stats',
                'project_download',
                'project_edit'
            ) \
            .filter(is_superuser=False)
        response = CollectorSerializer(collectors, many=True, context={'project_id': projectID})

        return Response(response.data)
