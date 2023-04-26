from rest_framework import serializers
from .models import File
from attribute.serializers import AttributeGroupSerializer

class FileSerializer(serializers.ModelSerializer):
    attributes = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = File
        exclude = ['hash_name', 'project', 'attribute', 'author']

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

        new_groups = [
            self._handle_group_change(group, current_attributes)
            for group in new_attributes
        ]

        # self.instance.attributegroup_set.set(filter(lambda el: el, new_groups))

    def _handle_group_change(self, group, current_groups):
        key, new_ids = group

        model = set(filter(lambda obj: str(obj.uid) == key, current_groups))

        if model:
            upd_group, *_ = model
            current_ids = set(upd_group.attribute.values_list('id', flat=True))
            if set(new_ids) != current_ids: model.attribute.set(new_ids)

        else:
            new_group = self.instance.attributegroup_set.create()
            new_group.attribute.set(new_ids)
            return str(new_group.uid)

