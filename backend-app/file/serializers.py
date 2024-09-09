from rest_framework.serializers import SerializerMethodField, ModelSerializer
from typing import Any
from django.utils import timezone
from collections import OrderedDict
from attribute.serializers import AttributeGroupSerializer
from .models import File
from user.models import CustomUser
from typing import Optional
from django.db import transaction


class FileSerializer(ModelSerializer):
    attributes: SerializerMethodField = SerializerMethodField()
    author_name: SerializerMethodField = SerializerMethodField()
    validator_name: SerializerMethodField = SerializerMethodField()

    class Meta:
        model = File
        exclude = ("project", "author", "validator")

    def get_attributes(self, instance: File) -> list[OrderedDict[str, Any]]:
        return AttributeGroupSerializer(instance.attributegroup_set.all(), many=True).data

    def get_author_name(self, instance: File) -> str: return instance.author.username

    def get_validator_name(self, instance: File) -> str:
        validator: Optional[CustomUser] = instance.validator
        return validator and validator.username

    def update_file(self) -> File:
        self.validated_data["update_date"] = timezone.now()
        self.validated_data["validator"] = self.context.get("validator")

        if self.validated_data["status"] == "r":
            self.instance.rebound = self.initial_data["rebound"]
            self.instance.save()

        else:
            with transaction.atomic():
                super().update(self.instance, self.validated_data)
                self.instance.update_attributes(self.initial_data.get("attribute", {}))

        return self.instance


class FilesSerializer(ModelSerializer):

    class Meta:
        model = File
        fields = ("id",)
