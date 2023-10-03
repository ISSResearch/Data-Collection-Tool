from rest_framework.serializers import SerializerMethodField, ModelSerializer
from typing import Any
from collections import OrderedDict
from attribute.serializers import AttributeGroupSerializer
from .models import File


class FileSerializer(ModelSerializer):
    attributes: SerializerMethodField = SerializerMethodField()
    author_name: SerializerMethodField = SerializerMethodField()

    class Meta:
        model = File
        exclude = ("project", "author")

    def get_attributes(self, instance: File) -> list[OrderedDict[str, Any]]:
        return AttributeGroupSerializer(instance.attributegroup_set.all(), many=True).data

    def get_author_name(self, instance: File) -> str: return instance.author.username

    def update_file(self) -> File:
        super().save()

        self.instance.update_attributes(self.initial_data.get("attribute", {}))

        return self.instance


class FilesSerializer(ModelSerializer):

    class Meta:
        model = File
        fields = ("id",)
