from rest_framework.serializers import SerializerMethodField, ModelSerializer
from django.utils import timezone
from attribute.serializers import AttributeGroupSerializer
from .models import File
from typing import Optional
from django.db import transaction


class FileSerializer(ModelSerializer):
    related_duplicates = SerializerMethodField()
    attributes = AttributeGroupSerializer(source="attributegroup_set", many=True, required=False)
    author_name = SerializerMethodField()
    validator_name = SerializerMethodField()

    class Meta:
        model = File
        exclude = ("project", "author", "validator")

    def get_related_duplicates(self, instance: File) -> int:
        return getattr(instance, "related_count", 0)

    def get_author_name(self, instance: File) -> str: return instance.author.username

    def get_validator_name(self, instance: File) -> Optional[str]:
        return (validator := instance.validator) and validator.username

    def update_file(self) -> File:
        self.validated_data["update_date"] = timezone.now()

        if (validator := self.context.get("validator")) and validator.id:
            self.validated_data["validator"] = validator

        with transaction.atomic():
            super().update(self.instance, self.validated_data)

            if isinstance(attributes := self.initial_data.get("attribute"), dict):
                self.instance.update_attributes(attributes)

        return self.instance


class FilesSerializer(ModelSerializer):

    class Meta:
        model = File
        fields = ("id",)
