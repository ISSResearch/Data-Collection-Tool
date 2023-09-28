from rest_framework.serializers import ModelSerializer, SerializerMethodField
from .models import CustomUser


class CollectorSerializer(ModelSerializer):
    permissions = SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'permissions')

    def get_permissions(self, instance: CustomUser) -> dict[str, bool]:
        project_id: int = self.context.get('project_id')
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
