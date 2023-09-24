from rest_framework import serializers
from .models import CustomUser


class CollectorSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'permissions')

    def get_permissions(self, instance):
        project_id = self.context.get('project_id')
        if not project_id: return {}

        return {
            'visible': project_id in {project.id for project in instance.project_visible.all()},
            'view': project_id in {project.id for project in instance.project_view.all()},
            'upload': project_id in {project.id for project in instance.project_upload.all()},
            'validate': project_id in {project.id for project in instance.project_validate.all()},
            'stats': project_id in {project.id for project in instance.project_stats.all()},
            'download': project_id in {project.id for project in instance.project_download.all()},
            'edit': project_id in {project.id for project in instance.project_edit.all()},
        }
