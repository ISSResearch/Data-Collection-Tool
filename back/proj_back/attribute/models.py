from django.db import models
from tree_queries.models import TreeNode

# Fetch nodes in depth-first search order: .objects.with_tree_fields()
# All nodes will have the tree_path, tree_ordering and tree_depth attributes.
# Fetch any node: .objects.order_by("?").first()
# Fetch all ancestors starting from the root: .ancestors(include_self=True)
# Fetch direct children: .children.with_tree_fields()
# Fetch all descendants in depth-first search order, including self: .descendants(include_self=True)
# Temporarily override the ordering by siblings: Node.objects.order_siblings_by("id")
# Breadth-first search: .objects.with_tree_fields().extra(order_by=["__tree.tree_depth", "__tree.tree_ordering"])
# Filter by depth: .objects.with_tree_fields().extra(where=["__tree.tree_depth <= %s"], params=[1])
class Attribute(TreeNode):
    name = models.CharField(max_length=255)
    project = models.ForeignKey('project.Project', on_delete=models.DO_NOTHING)
    level = models.ForeignKey('attribute.Level', on_delete=models.DO_NOTHING)

    class Meta: db_table = 'attribute'

    def __str__(self): return self.name


class Level(TreeNode):
    uid = models.BigIntegerField()
    name = models.CharField(max_length=255)
    project = models.ForeignKey('project.Project', on_delete=models.DO_NOTHING)

    class Meta: db_table = 'level'

    def __str__(self): return self.name