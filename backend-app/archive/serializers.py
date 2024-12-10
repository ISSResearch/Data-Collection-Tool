from rest_framework.serializers import ModelSerializer
from typing import Any
from .models import Archive


class ArchiveSerializer(ModelSerializer):
    class Meta:
        model = Archive
        fields = ("id", "result_id", "status",)
