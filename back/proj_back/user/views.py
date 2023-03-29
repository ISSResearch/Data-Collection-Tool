from django.contrib.auth import authenticate, login, logout
from user.forms import CreateUserForm
from rest_framework.views import Response, APIView
from rest_framework.decorators import api_view
from .serializers import CustomUser, UserSerializer
from django.views.decorators.http import require_GET
from django.http import JsonResponse


@api_view(('POST',))
def login_user(request):
    response = {'isAuth': True}

    if not request.user.is_authenticated:
        username, password = request.data.get('username'), request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)
            serialized_user = UserSerializer(user)
            response['user'] = serialized_user.data
        else:
            response['ok'] = False
            response['message'] = 'No user found or wrong credentials'

    return Response(response)


@require_GET
def logout_user(request):
    logout(request)
    return JsonResponse({'ok': True})


@api_view(('GET',))
def check_user(request):
    user = request.user
    response = {'isAuth': user.is_authenticated}
    if user.is_authenticated: response['user'] = UserSerializer(user).data
    return Response(response)


@api_view(('POST',))
def create_user(request):
    form = CreateUserForm(request.data)

    is_valid = form.is_valid()
    if is_valid: form.save()

    response = {'isAuth': is_valid}

    if is_valid: response['user'] = UserSerializer(form.instance).data
    else: response['errors'] = form.errors

    return Response(response)


class User(APIView):
    http_method_names = ('get', 'put', 'path')

    def get(self, request, user_id):
        user = CustomUser.objects.get(id=user_id)
        response = UserSerializer(user)
        return Response(response.data)

    def put(self, request, user_id): ...

    def patch(self, request, user_id): ...
