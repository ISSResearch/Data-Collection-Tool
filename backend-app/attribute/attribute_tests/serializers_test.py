from django.test import TestCase
from attribute.models import Attribute, Level, AttributeGroup
from .mock_attribute import MockCase
from attribute.serializers import (
    AttributeSerializer,
    LevelSerializer,
    AttributeGroupSerializer
)


class AttributeSerializerTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()

    def test_attribute_serializer(self):
        child_attribute = Attribute.objects.create(
            name="name",
            parent=self.case.attribute,
            level=self.case.level,
            project=self.case.project
        )
        parent_data = AttributeSerializer(self.case.attribute).data
        child_data = AttributeSerializer(child_attribute).data

        self.assertEqual(set(parent_data.keys()), {'id', 'name', 'parent'})
        self.assertIsNone(parent_data.get("parent"))
        self.assertIsNotNone(child_data.get("parent"))


class LevelSerializerTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()

    def test_level_serializer(self):
        child_level = Level.objects.create(
            uid=12312312,
            name="name",
            parent=self.case.level,
            project=self.case.project
        )

        parent_data = LevelSerializer(self.case.level).data
        child_data = LevelSerializer(child_level).data

        self.assertEqual(
            set(parent_data.keys()),
            {
                'id',
                'attributes',
                'uid',
                'name',
                'multiple',
                'required',
                'order',
                'parent',
                'project'
            }
        )

        self.assertEqual(
            set(parent_data['attributes'][0].keys()),
            {'id', 'name', 'parent'}
        )
        self.assertIsNone(parent_data.get("parent"))
        self.assertIsNotNone(child_data.get("parent"))


class AttributeGroupSerializerTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()

    def test_attributegroup_serializer(self):
        data = AttributeGroupSerializer(self.case.attributegroup).data

        self.assertEqual(set(data.keys()), {'uid', 'attributes'})
        self.assertEqual(
            set(data['attributes'][0]),
            {
                self.case.attribute.id,
                self.case.attribute.level.order,
                self.case.attribute.name
            },
        )
