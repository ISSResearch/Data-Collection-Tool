from rest_framework.serializers import ModelSerializer, SerializerMethodField
from typing import Any
from .models import Attribute, Level, AttributeGroup


class AttributeSerializer(ModelSerializer):

    class Meta:
        model = Attribute
        fields = ("id", "name", "parent")


class LevelSerializer(ModelSerializer):
    attributes = SerializerMethodField()

    class Meta:
        model = Level
        fields = "__all__"

    def get_attributes(self, instance: Level) -> dict[str, Any]:
        attributes = AttributeSerializer(
            instance.attribute_set.order_by("order", "id").all(),
            many=True
        )

        return attributes.data


class AttributeGroupSerializer(ModelSerializer):
    attributes = SerializerMethodField()

    class Meta:
        model = AttributeGroup
        fields = ("uid", "attributes")

    def get_attributes(self, instance: AttributeGroup) -> tuple[tuple[int, int, str]]:
        return tuple(
            (attr.id, attr.level.order, attr.name)
            for attr in instance.attribute.all()
        )
