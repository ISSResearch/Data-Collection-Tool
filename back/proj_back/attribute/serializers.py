from rest_framework import serializers
from .models import Attribute, Level, AttributeGroup


class AttributeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Attribute
        fields = ('id', 'name', 'parent')


class LevelSerializer(serializers.ModelSerializer):
    attributes = serializers.SerializerMethodField()

    class Meta:
        model = Level
        fields = ('id', 'name', 'attributes', 'parent')

    def get_attributes(self, instance):
        attributes = AttributeSerializer(instance.attribute_set.all(), many=True)

        return attributes.data


class AttributeGroupSerializer(serializers.ModelSerializer):
    attributes = serializers.SerializerMethodField()

    class Meta:
        model = AttributeGroup
        exclude = ('file', 'attribute')

    def get_attributes(self, instance):
        return tuple(instance.attribute.values_list('id', 'parent_id', 'name'))
