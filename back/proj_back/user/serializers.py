from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'is_superuser')


class CollectorSerializer(UserSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta(UserSerializer.Meta):
        fields = ('id', 'username', 'permissions')

    def get_permissions(self, instance):
        project_id = self.context.get('project_id')
        if not project_id: return {}

        return {
            'view': project_id in {project.id for project in instance.project_view.all()},
            'upload': project_id in {project.id for project in instance.project_upload.all()},
            'validate': project_id in {project.id for project in instance.project_validate.all()},
            'stats': project_id in {project.id for project in instance.project_stats.all()},
            'download': project_id in {project.id for project in instance.project_download.all()},
            'edit': project_id in {project.id for project in instance.project_edit.all()},
        }
# TODO: changed - revise tests