from django.db import models
from tree_queries.models import TreeNode
from uuid import uuid4


class Attribute(TreeNode):
    name = models.CharField(max_length=255)

    project = models.ForeignKey('project.Project', on_delete=models.DO_NOTHING)
    level = models.ForeignKey('attribute.Level', on_delete=models.DO_NOTHING)

    class Meta: db_table = 'attribute'

    def __str__(self): return self.name


class Level(TreeNode):
    uid = models.BigIntegerField()
    name = models.CharField(max_length=255)
    multiple = models.BooleanField(default=False, null=True)
    required = models.BooleanField(default=False, null=True)

    project = models.ForeignKey('project.Project', on_delete=models.DO_NOTHING)

    class Meta: db_table = 'level'

    def __str__(self): return self.name


class AttributeGroup(models.Model):
    uid = models.UUIDField(primary_key=True, default=uuid4, editable=False)

    file = models.ForeignKey('file.File', null=True, on_delete=models.DO_NOTHING)
    attribute = models.ManyToManyField('attribute.Attribute')

    class Meta: db_table = 'attribute_group'

    def __str__(self): return str(self.uid)

    @classmethod
    def get_free_groups(cls): return cls.objects.filter(file_id=None)
