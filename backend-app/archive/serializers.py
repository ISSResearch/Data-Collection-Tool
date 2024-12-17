from rest_framework.serializers import ModelSerializer, ChoiceField, SerializerMethodField, IntegerField
from .models import Archive


class StatusChoiceField(ChoiceField):
    def to_representation(self, value: str) -> str: return self.choices[value]


class ArchiveSerializer(ModelSerializer):
    status = StatusChoiceField(choices=Archive.STATUSES)
    author = SerializerMethodField()
    file_count = IntegerField()

    class Meta:
        model = Archive
        exclude = ("file", "project")

    def get_author(self, instance: Archive): return instance.author.username
