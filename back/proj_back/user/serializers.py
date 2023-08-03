from rest_framework import serializers
from .models import CustomUser


class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'is_superuser', 'permissions')

    def get_permissions(self, instance):
        return instance.user_permissions.values_list('codename', flat=True)
# TODO: changed - revise tests