from django.test import TestCase
from attribute.models import Attribute, Level, AttributeGroup
from project.models import Project
from .mock_attribute import MockCase


class LevelModelTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.project = Project.objects.create(name="name")

    def test_create_level(self):
        parent_data = {
            "uid": 1275638,
            "name": 'parent_level',
            "project": self.project
        }
        child_data = {
            "uid": 19284728,
            "name": 'child_level',
            "project": self.project,
            "multiple": True,
            "required": True,
            "order": 1
        }
        parent_level = Level.objects.create(**parent_data)
        child_level = Level.objects.create(**child_data, parent=parent_level)

        self._base_fields_mixin(parent_level, parent_data)
        self._base_fields_mixin(child_level, child_data)

        self.assertEqual(parent_level.descendants().first(), child_level)
        self.assertEqual(child_level.parent, parent_level)
        self.assertTrue(parent_level.project == child_level.project == self.project)
        self.assertEqual(self.project.level_set.count(), 2)

    def _base_fields_mixin(self, level, init_data):
        check_fields = (
            "uid",
            "name",
            "multiple",
            "required",
            "order"
        )
        check_against = {
            key: init_data.get(key, False if key != "order" else 0)
            for key in check_fields
        }

        self.assertTrue(all([
            level.__dict__.get(key) == value
            for key, value
            in check_against.items()
        ]))


class AttributeModelTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()

    def test_attribute_create(self):
        atr_name = "attribute_name"

        self.assertEqual(
            self.case.project.attribute_set.count(),
            self.case.level.attribute_set.count()
        )

        init_count = self.case.level.attribute_set.count()

        parent_attribute = Attribute.objects.create(
            name=atr_name,
            project=self.case.project,
            level=self.case.level
        )
        child_attribute = Attribute.objects.create(
            name=atr_name,
            project=self.case.project,
            level=self.case.level,
            order=1,
            parent=parent_attribute
        )

        self.assertTrue(parent_attribute.name == child_attribute.name == atr_name)
        self.assertEqual(parent_attribute.order, 0)
        self.assertEqual(child_attribute.order, 1)
        self.assertTrue(init_count + 2, self.case.level.attribute_set.count())
        self.assertTrue(parent_attribute.level == child_attribute.level == self.case.level)
        self.assertTrue(parent_attribute.project == child_attribute.project == self.case.project)
        self.assertEqual(parent_attribute.descendants().first(), child_attribute)
        self.assertEqual(child_attribute.parent, parent_attribute)


class AttributeGroupModelTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()

    def test_attributegrop_create(self):
        init_count = self.case.file_.attributegroup_set.count()
        init_count_ag_for_atr = self.case.attribute.attributegroup_set.count()

        group = AttributeGroup.objects.create(file=self.case.file_)
        group.attribute.set({self.case.attribute})

        self.assertEqual(init_count + 1, self.case.file_.attributegroup_set.count())
        self.assertEqual(
            init_count_ag_for_atr + 1,
            self.case.attribute.attributegroup_set.count()
        )
        self.assertEqual(group.attribute.count(), 1)
        self.assertTrue(group.file.id == self.case.file_.id)
