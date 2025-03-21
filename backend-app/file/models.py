from django.db.models import (
    Model,
    CharField,
    DateTimeField,
    IntegerField,
    ForeignKey,
    DO_NOTHING,
    QuerySet,
)
from uuid import UUID
from attribute.models import AttributeGroup


class File(Model):
    STATUSES: tuple = (
        ("p", "processing"),
        ('v', "validation"),
        ('a', "accepted"),
        ('d', "declined"),
        ("u", "duplicated"),
    )

    id: CharField = CharField(max_length=24, primary_key=True, unique=True)
    file_name: CharField = CharField(max_length=255)
    file_type: CharField = CharField(max_length=10)
    status: CharField = CharField(max_length=1, choices=STATUSES, default='p')
    upload_date: DateTimeField = DateTimeField(auto_now_add=True)
    update_date: DateTimeField = DateTimeField(auto_now_add=True, null=True)

    project: ForeignKey = ForeignKey("project.Project", on_delete=DO_NOTHING)
    author: ForeignKey = ForeignKey("user.CustomUser", on_delete=DO_NOTHING)
    rebound: ForeignKey = ForeignKey("self", on_delete=DO_NOTHING, null=True)
    # todo: temp to remap storge bucket on file migration from project to projcet
    rebound_project = IntegerField(null=True)
    validator: ForeignKey = ForeignKey(
        "user.CustomUser",
        null=True,
        on_delete=DO_NOTHING,
        related_name="validator"
    )

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

        new_groups: set[str] = {
            self._handle_group_change(
                group,
                current_attributes,
                attributes_by_group
            )
            for group in new_attributes.items()
        }

        delete_groups: set[str] = {
            str(group.uid)
            for group in current_attributes
        } - new_groups

        current_attributes.filter(uid__in=delete_groups).delete()

    def _handle_group_change(
        self,
        group: tuple[str, list[int | str]],
        current_groups: QuerySet,
        attributes_by_group: dict[UUID, list[int]]
    ) -> str:
        key, new_ids = group
        newKey: str = ""

        model: set[AttributeGroup] = set(
            filter(lambda obj: str(obj.uid) == key, current_groups)
        )

        if model:
            upd_group, *_ = model
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
