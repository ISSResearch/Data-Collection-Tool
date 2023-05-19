from django.db import models
from attribute.models import Level, Attribute

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

        try:
          LEVEL, changed = self.level_set.get(id=current_level['id']), False

          if LEVEL.name != current_level['name']:
              LEVEL.name = current_level['name']
              changed = True
          if LEVEL.multiple != current_level['multiple']:
              LEVEL.multiple = current_level['multiple']
              changed = True

          if changed: LEVEL.save()

        except Level.DoesNotExist:
           LEVEL = self.level_set.create(
                uid=current_level['id'],
                name=current_level['name'],
                parent=parent_level,
                multiple=current_level.get('multiple')
            )

        for attribute in attributes:
            name, children = attribute['name'], attribute['children']

            try:
                PARENT = self.attribute_set.get(id=attribute['id'])
                if PARENT.name != name:
                    PARENT.name = name
                    PARENT.save()
            except Attribute.DoesNotExist:
                PARENT = self.attribute_set.create(
                    name=name,
                    parent=parent_attribute,
                    level=LEVEL
                )

            if children: self._create_attributes(children, rest, PARENT, LEVEL)
