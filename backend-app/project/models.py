from django.db.models import (
    Model,
    CharField,
    TextField,
    DateTimeField,
    BooleanField,
    ManyToManyField
)
from attribute.models import Level, Attribute
from typing import Any


class Project(Model):
    name: CharField = CharField(max_length=255)
    description: TextField = TextField(blank=True)
    created_at: DateTimeField = DateTimeField(auto_now_add=True)
    visible: BooleanField = BooleanField(default=True)

    user_visible: ManyToManyField = ManyToManyField(
        to="user.CustomUser",
        related_name="project_visible"
    )
    user_upload: ManyToManyField = ManyToManyField(
        to="user.CustomUser",
        related_name="project_upload"
    )
    user_view: ManyToManyField = ManyToManyField(
        to="user.CustomUser",
        related_name="project_view"
    )
    user_validate: ManyToManyField = ManyToManyField(
        to="user.CustomUser",
        related_name="project_validate"
    )
    user_stats: ManyToManyField = ManyToManyField(
        to="user.CustomUser",
        related_name="project_stats"
    )
    user_download: ManyToManyField = ManyToManyField(
        to="user.CustomUser",
        related_name="project_download"
    )
    user_edit: ManyToManyField = ManyToManyField(
        to="user.CustomUser",
        related_name="project_edit"
    )

    class Meta:
        db_table = "project"

    def __str__(self): return self.name

    def add_attributes(self, form: dict[str, Any]) -> None:
        self._create_attributes(form["attributes"], form["levels"])

    def _create_attributes(
        self,
        attributes: list[dict[str, Any]],
        levels: list[dict[str, Any]],
        parent_attribute: None | Attribute = None,
        parent_level: None | Level = None
    ) -> None:
        current_level, *rest = levels
        current_level_id: str = current_level.get("uid", current_level["id"])

        try:
            LEVEL: Level = self.level_set.get(uid=current_level_id)
            changed: bool = False

            if LEVEL.name != current_level["name"]:
                LEVEL.name = current_level["name"]
                changed = True

            if LEVEL.multiple != current_level.get("multiple", False):
                LEVEL.multiple = current_level.get("multiple", False)
                changed = True

            if LEVEL.required != current_level.get("required", False):
                LEVEL.required = current_level.get("required", False)
                changed = True

            if changed: LEVEL.save()

        except Level.DoesNotExist:
            LEVEL: Level = self.level_set.create(
                uid=current_level_id,
                name=current_level["name"],
                parent=parent_level,
                multiple=current_level.get("multiple"),
                required=current_level.get("required"),
                order=current_level.get("order", 0)
            )

        if rest and not attributes: self._create_attributes([], rest, None, LEVEL)

        for attribute in attributes:
            name: str = attribute["name"]
            children: list[dict[str, Any]] = attribute["children"]

            try:
                PARENT: Attribute = self.attribute_set.get(id=attribute["id"])
                if PARENT.name != name:
                    PARENT.name = name
                    PARENT.save()

            except Attribute.DoesNotExist:
                PARENT: Attribute = self.attribute_set.create(
                    name=name,
                    parent=parent_attribute,
                    level=LEVEL
                )

            if children: self._create_attributes(children, rest, PARENT, LEVEL)
            elif rest: self._create_attributes([], rest, None, LEVEL)
