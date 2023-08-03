from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()
    projects = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'is_superuser', 'permissions', 'projects')

    def get_permissions(self, instance):
        if instance.is_superuser: return tuple()

        permissions = instance.user_permissions.all()

        return { permission.codename for permission in permissions}

    def get_projects(self, instance):
        if instance.is_superuser: return tuple()

        projects = instance.project_set.all()

        return { project.id for project in projects }
# TODO: changed - revise tests