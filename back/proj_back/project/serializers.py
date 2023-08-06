from rest_framework import serializers
from .models import Project
from attribute.serializers import LevelSerializer


class ProjectsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'created_at')

    def add_attributes(self):
        attributeForm = self.initial_data.get('attributes', [])
        for form in attributeForm: self.instance.add_attributes(form)


class ProjectSerializer(ProjectsSerializer):
    attributes = serializers.SerializerMethodField()
    permissions = serializers.SerializerMethodField()

    class Meta(ProjectsSerializer.Meta):
        fields = ('id', 'name', 'description', 'attributes', 'permissions')

    def get_attributes(self, instance):
        levels = LevelSerializer(
            instance.level_set.order_by('order', 'id').all(),
            many=True
        )
        return levels.data

    def get_permissions(self, instance):
        request = self.context.get('request')
        if not request: return {}

        user_id = request.user.id
        return {
            'upload': user_id in {user.id for user in instance.user_upload.all()},
            'validate': user_id in {user.id for user in instance.user_validate.all()},
            'stats': user_id in {user.id for user in instance.user_stats.all()},
            'download': user_id in {user.id for user in instance.user_download.all()},
            'edit': user_id in {user.id for user in instance.user_edit.all()},
        }
# TODO: changed - revise tests