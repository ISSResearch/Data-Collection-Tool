from rest_framework import serializers
from .models import Project
from attribute.serializers import LevelSerializer


class ProjectsSerializer(serializers.ModelSerializer):

    class Meta:
        model = Project
        fields = '__all__'

    def add_attributes(self):
        attributeForm = self.initial_data.get('attributes', [])
        for form in attributeForm: self.instance.add_attributes(form)


class ProjectSerializer(ProjectsSerializer):
    attributes = serializers.SerializerMethodField()

    def get_attributes(self, instance):
        levels = LevelSerializer(
            instance.level_set.order_by('id').all(),
            many=True
        )
        return levels.data
