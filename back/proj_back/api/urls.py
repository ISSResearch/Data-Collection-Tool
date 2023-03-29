from django.urls import path, include

def q(request, path):
    from django.http import HttpResponse
    return HttpResponse('ok')



urlpatterns = [
    path('users/', include('user.urls')),
    path('projects/', include('project.urls')),
    path('files/', include('file.urls'))
]
