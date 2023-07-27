from rest_framework import serializers
from .models import File
from attribute.serializers import AttributeGroupSerializer


class FileSerializer(serializers.ModelSerializer):
    attributes = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = File
        exclude = ('hash_name', 'project', 'author')

    def get_attributes(self, instance):
        return AttributeGroupSerializer(instance.attributegroup_set.all(), many=True).data

    def get_author_name(self, instance): return instance.author.username

    def update_file(self):
        super().save()

        self.update_attributes()

        return self.instance

    def update_attributes(self):
        new_attributes = self.initial_data.get('attribute', {})

        current_attributes = self.instance.attributegroup_set.all()

        new_groups = {
            self._handle_group_change(group, current_attributes)
            for group in new_attributes.items()
        }

        delete_groups = set(str(group.uid) for group in current_attributes) - new_groups

        current_attributes.filter(uid__in=delete_groups).delete()

    def _handle_group_change(self, group, current_groups):
        key, new_ids = group
        newKey = None

        model = set(filter(lambda obj: str(obj.uid) == key, current_groups))

        if model:
            upd_group, *_ = model
            current_ids = set(upd_group.attribute.values_list('id', flat=True))
            if set(new_ids) != current_ids: upd_group.attribute.set(new_ids)

        else:
            new_group = self.instance.attributegroup_set.create()
            new_group.attribute.set(new_ids)
            newKey = str(new_group.uid)

        return newKey or key


class FilesSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ('id',)
