from rest_framework import serializers
from .models import Attribute, Level


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
