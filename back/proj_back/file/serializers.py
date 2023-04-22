from rest_framework import serializers
from .models import File
from attribute.serializers import AttributeGroupSerializer

class FileSerializer(serializers.ModelSerializer):
    attributes = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = File
        exclude = ['hash_name', 'project', 'attribute', 'author']

    def get_attributes(self, instance):
        return AttributeGroupSerializer(instance.attributegroup_set.all(), many=True).data

    def get_author_name(self, instance): return instance.author.username

    def update_file(self):
        super().save()

        newAttributes = self.initial_data.get('attribute', [])
        self.instance.attribute.set(newAttributes)

        return self.instance
