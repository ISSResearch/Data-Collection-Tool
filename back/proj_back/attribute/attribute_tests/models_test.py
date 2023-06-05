from django.test import TestCase
from attribute.models import Attribute, Level, AttributeGroup
from project.models import Project
from file.models import File
from user.models import CustomUser


class AttributeModelsTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        AttributeModelsTest.user = CustomUser.objects.create(username='u_name', password='123')
        AttributeModelsTest.project = Project.objects.create(name='p_name')
        AttributeModelsTest.file = File.objects.create(
            file_name='f_name',
            project=cls.project,
            author_id=cls.user.id
        )
        AttributeModelsTest.level = Level.objects.create(
            uid=19284728134134,
            name='l_name',
            project=cls.project
        )
        AttributeModelsTest.attribute = Attribute.objects.create(
            name='parent_atr',
            project=cls.project,
            level=cls.level
        )

    def test_attribute_create(self):
        parent_attribute = Attribute.objects.create(
            name='parent_atr',
            project=self.project,
            file=self.file,
            level=self.level
        )
        child_attribute = Attribute.objects.create(
            name='child_atr',
            parent=parent_attribute,
            project=self.project,
            file=self.file,
            level=self.level
        )

        self.assertTrue(parent_attribute.descendants().first(), child_attribute)
        self.assertTrue(parent_attribute.descendants().count() == 1)
        self.assertEqual(child_attribute.parent, parent_attribute)
        self.assertTrue(self.project.attribute_set.count() == 3)
        self.assertTrue(self.level.attribute_set.count(), 3)

    def test_level_create(self):
        parent_level = Level.objects.create(
            uid=1275638,
            name='parent_level',
            project=self.project
        )
        child_level = Level.objects.create(
            uid=19284728,
            name='child_level',
            project=self.project,
            parent=parent_level
        )

        self.assertTrue(parent_level.descendants().first(), child_level)
        self.assertTrue(parent_level.descendants().count() == 1)
        self.assertEqual(child_level.parent, parent_level)
        self.assertTrue(self.project.level_set.count() == 3)

    def test_attributegrop_create(self):
        attributegroup = AttributeGroup.objects.create(file=self.file)
        attributegroup.attribute.set({self.attribute})

        self.assertTrue(attributegroup.attribute.count() == 1)
        self.assertTrue(attributegroup.file.id == self.file.id)
        self.assertTrue(self.file.attributegroup_set.count() == 1)

    def test_get_free_attributegroups(self):
        groups = AttributeGroup.objects.bulk_create({
            AttributeGroup() for _ in range(5)
        })

        self.assertTrue(AttributeGroup.get_free_groups().count() == len(groups))
