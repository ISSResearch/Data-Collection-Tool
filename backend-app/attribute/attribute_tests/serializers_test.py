from django.test import TestCase
from .mock_attribute import MockCase
from attribute.serializers import (
    AttributeSerializer,
    LevelSerializer,
    AttributeGroupSerializer
)


class AttributeSerializersTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        AttributeSerializersTest.case = MockCase()

    def test_attribute_serializers(self):
        data = AttributeSerializer(self.case.attribute).data

        self.assertEqual(set(data.keys()), {'id', 'name', 'parent'})
        self.assertEqual(
            set(data.values()),
            {
                val for key, val in self.case.attribute.__dict__.items()
                if key in {'id', 'name', 'parent_id'}
            }
        )

    def test_level_serializer(self):
        data = LevelSerializer(self.case.level).data

        self.assertEqual(
            set(data.keys()),
            {'id', 'attributes', 'uid', 'name', 'multiple', 'required', 'order', 'parent', 'project'}
        )
        self.assertEqual(
            {
                val for key, val in data.items()
                if key in {'id', 'uid', 'name', 'multiple', 'required', 'order', 'parent', 'project'}
            },
            {
                val for key, val in self.case.level.__dict__.items()
                if key in {'id', 'uid', 'name', 'multiple', 'required', 'order', 'parent_id', 'project_id'}
            }
        )
        self.assertEqual(
            set(data['attributes'][0].keys()),
            {'id', 'name', 'parent'}
        )
        self.assertEqual(
            set(data['attributes'][0].values()),
            {
                val for key, val in self.case.attribute.__dict__.items()
                if key in {'id', 'name', 'parent_id'}
            }
        )

    def test_attributegroup_serializer(self):
        data = AttributeGroupSerializer(self.case.attributegroup).data

        self.assertEqual(set(data.keys()), {'uid', 'attributes'})
        self.assertTrue(data['uid'] == str(self.case.attributegroup.uid))
        self.assertEqual(
            set(data['attributes'][0]),
            {
                self.case.attribute.id,
                self.case.attribute.level.order,
                self.case.attribute.name
            },
        )
