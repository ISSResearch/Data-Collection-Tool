from django.db.models import (
    CharField,
    ForeignKey,
    DO_NOTHING,
    BigIntegerField,
    Model,
    ManyToManyField,
    UUIDField,
    BooleanField,
    TextField,
    CASCADE,
    IntegerField
)
from tree_queries.models import TreeNode
from uuid import uuid4


class Attribute(TreeNode):
    name: CharField = CharField(max_length=255)

    project: ForeignKey = ForeignKey("project.Project", on_delete=DO_NOTHING)
    level: ForeignKey = ForeignKey("attribute.Level", on_delete=DO_NOTHING)

    order: BigIntegerField = BigIntegerField(default=0)

    class Meta:
        db_table = "attribute"

    def __str__(self) -> str: return self.name


class Level(TreeNode):
    uid: BigIntegerField = BigIntegerField()
    name: CharField = CharField(max_length=255)
    multiple: BooleanField = BooleanField(default=False, null=True)
    required: BooleanField = BooleanField(default=False, null=True)
    order: BigIntegerField = BigIntegerField(default=0)

    project: ForeignKey = ForeignKey("project.Project", on_delete=DO_NOTHING)

    class Meta:
        db_table = "level"

    def __str__(self) -> str: return self.name


class AttributeGroup(Model):
    uid: UUIDField = UUIDField(primary_key=True, default=uuid4, editable=False)

    file: ForeignKey = ForeignKey("file.File", null=True, on_delete=DO_NOTHING)
    attribute: ManyToManyField = ManyToManyField("attribute.Attribute")

    class Meta:
        db_table = "attribute_group"

    def __str__(self) -> str: return str(self.uid)


class ProjectGoal(Model):
    name = TextField()
    amount = IntegerField(default=0)
    image_mod = IntegerField(default=1)
    video_mod = IntegerField(default=1)

    attribute = ForeignKey("attribute.Attribute", on_delete=CASCADE)
    project = ForeignKey("project.Project", on_delete=CASCADE)

    class Meta:
        db_table = "project_goal"
