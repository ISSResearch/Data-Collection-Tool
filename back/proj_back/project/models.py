from django.db import models

class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta: db_table = 'project'

    def __str__(self): return self.name

    #TODO: group creation of attributes to reduce queries amount
    def add_attributes(self, form):
        attributes, levels = form['attributes'], form['levels']
        self._create_attributes(attributes, levels)

    def _create_attributes(
        self,
        attributes,
        levels,
        parent_attribute=None,
        parent_level=None
    ):
        current_level, *rest = levels
        LEVEL, _ = self.level_set.get_or_create(
            uid=current_level['id'],
            name=current_level['name'],
            parent=parent_level
        )

        for attribute in attributes:
            name, children = attribute['name'], attribute['children']

            PARENT = self.attribute_set.create(
                name=name,
                parent=parent_attribute,
                level=LEVEL
            )

            if children: self._create_attributes(children, rest, PARENT, LEVEL)
