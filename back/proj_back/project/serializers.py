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

    class Meta(ProjectsSerializer.Meta):
        fields = ('attributes',)

    def get_attributes(self, instance):
        levels = LevelSerializer(
            instance.level_set.order_by('order', 'id').all(),
            many=True
        )
        return levels.data
# TODO: changed - revise tests