from django.db.models import (
    Model,
    CharField,
    DateTimeField,
    BooleanField,
    ForeignKey,
    DO_NOTHING,
    QuerySet
)
from uuid import UUID


class File(Model):
    STATUSES: tuple = (('d', "declined"), ('a', "accepted"), ('v', "validation"))

    file_name: CharField = CharField(max_length=255)
    file_type: CharField = CharField(max_length=10)
    status: CharField = CharField(max_length=1, choices=STATUSES, default='v')
    upload_date: DateTimeField = DateTimeField(auto_now_add=True)
    is_downloaded: BooleanField = BooleanField(default=False)

    project: ForeignKey = ForeignKey("project.Project", on_delete=DO_NOTHING)
    author: ForeignKey = ForeignKey("user.CustomUser", on_delete=DO_NOTHING)

    class Meta:
        db_table = "file"

    def __str__(self): return self.file_name

    def update_attributes(self, new_attributes: dict[str, list[int | str]]) -> None:
        current_attributes: QuerySet = self.attributegroup_set \
            .prefetch_related("attribute") \
            .all()
        attributes_by_group: dict[UUID, list[int]] = self._get_attribute_ids(
            current_attributes.values_list("uid", "attribute")
        )

        new_groups = {
            self._handle_group_change(group, current_attributes, attributes_by_group)
            for group in new_attributes.items()
        }

        delete_groups = set(str(group.uid) for group in current_attributes) - new_groups

        current_attributes.filter(uid__in=delete_groups).delete()

    def _handle_group_change(
        self,
        group: tuple[str, list[int | str]],
        current_groups: QuerySet,
        attributes_by_group: dict[UUID, list[int]]
    ) -> str:
        key, new_ids = group
        newKey: str = ""

        model: set = set(filter(lambda obj: str(obj.uid) == key, current_groups))

        if model:
            upd_group, *_ = model
            # TODO: optimize: for each group im making new attribute request
            # current_ids = set(upd_group.attribute.values_list('id', flat=True))
            # if set(new_ids) != current_ids: upd_group.attribute.set(new_ids)
            # TODO: optimized: test
            if set(new_ids) != set(attributes_by_group.get(upd_group.uid, [])):
                upd_group.attribute.set(new_ids)

        else:
            new_group = self.attributegroup_set.create()
            new_group.attribute.set(new_ids)
            newKey = str(new_group.uid)

        return newKey or key

    def _get_attribute_ids(self, groups: QuerySet) -> dict[UUID, list[int]]:
        result: dict[UUID, list[int]] = {}

        for uid, attribute_id in groups:
            result[uid] = result.get(uid, []) + [attribute_id]

        return result
