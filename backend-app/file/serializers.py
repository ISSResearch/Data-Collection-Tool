from rest_framework.serializers import SerializerMethodField, ModelSerializer
from .models import File
from typing import Any


class FileSerializer(ModelSerializer):
    attributes: SerializerMethodField = SerializerMethodField()
    author_name: SerializerMethodField = SerializerMethodField()

    class Meta:
        model = File
        exclude = ('project', 'author')

    def get_attributes(self, instance: File) -> list[dict[str, Any]]:
        # TODO: temporary solution, cause could nt permorm, check
        # AttributeGroupSerializer(instance.attributegroup_set.all(), many=True).data
        return [
            {
                'uid': attribute_group.uid,
                'attributes': [
                    (attribute.id, attribute.level.order, attribute.name)
                    for attribute in attribute_group.attribute.all()
                ]
            }
            for attribute_group in instance.attributegroup_set.all()
        ]

    def get_author_name(self, instance: File) -> str: return instance.author.username

    def update_file(self) -> File:
        super().save()

        self.instance.update_attributes(self.initial_data.get('attribute', {}))

        return self.instance


class FilesSerializer(ModelSerializer):

    class Meta:
        model = File
        fields = ('id',)
