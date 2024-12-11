from rest_framework.serializers import ModelSerializer, ChoiceField
from .models import Archive


class StatusChoiceField(ChoiceField):
    def to_representation(self, value: str) -> str: return self.choices[value]


class ArchiveSerializer(ModelSerializer):
    status = StatusChoiceField(choices=Archive.STATUSES)

    class Meta:
        model = Archive
        fields = ("id", "result_id", "result_size", "status",)
