from django.db import models
from attribute.models import Level, Attribute


class Project(models.Model):
    HIDDEN_REASONS = (
        ('d', 'deleted'),
        ('h', 'manually_hidden'),
        ('b', 'broken_data'),
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    visible = models.BooleanField(default=True)
    reason_if_hidden = models.CharField(max_length=1, choices=HIDDEN_REASONS, blank=True)

    user_visible = models.ManyToManyField('user.CustomUser', related_name='project_view')
    user_upload = models.ManyToManyField('user.CustomUser', related_name='project_upload')
    user_validate = models.ManyToManyField('user.CustomUser', related_name='project_validate')
    user_stats = models.ManyToManyField('user.CustomUser', related_name='project_stats')
    user_download = models.ManyToManyField('user.CustomUser', related_name='project_download')
    user_edit = models.ManyToManyField('user.CustomUser', related_name='project_edit')

    class Meta:
        db_table = 'project'

    def __str__(self): return self.name

    def add_attributes(self, form):
        self._create_attributes(form['attributes'], form['levels'])

    def _create_attributes(
        self,
        attributes,
        levels,
        parent_attribute=None,
        parent_level=None
    ):
        current_level, *rest = levels

        try:
            lookup_value = current_level.get('uid', current_level['id'])
            LEVEL, changed = self.level_set.get(uid=lookup_value), False

            if LEVEL.name != current_level['name']:
                LEVEL.name = current_level['name']
                changed = True

            if LEVEL.multiple != current_level.get('multiple', False):
                LEVEL.multiple = current_level.get('multiple', False)
                changed = True

            if LEVEL.required != current_level.get('required', False):
                LEVEL.required = current_level.get('required', False)
                changed = True

            if changed: LEVEL.save()

        except Level.DoesNotExist:
            LEVEL = self.level_set.create(
                uid=lookup_value,
                name=current_level['name'],
                parent=parent_level,
                multiple=current_level.get('multiple'),
                required=current_level.get('required'),
                order=current_level.get('order', 0)
            )

        if rest and not attributes: self._create_attributes([], rest, None, LEVEL)

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
            elif rest: self._create_attributes([], rest, None, LEVEL)