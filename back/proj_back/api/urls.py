from django.urls import path, include

urlpatterns = [
    path('users/', include('user.urls')),
    path('projects/', include('project.urls')),
    path('files/', include('file.urls')),
    path('attributes/', include('attribute.urls'))
]
