from django.test import TestCase
from .mock_attribute import case_set_up
from attribute.models import Attribute, Level
from attribute.services import (
    check_level_delete,
    perform_level_delete,
    check_attribute_delete,
    perform_attribute_delete
)


class CheckServiceTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        case_legit, case_unassigned = case_set_up()
        CheckServiceTest.case_legit = case_legit
        CheckServiceTest.case_unassigned = case_unassigned

    def test_check_level(self):
        self.assertFalse(check_level_delete(self.case_legit.level))
        self.assertTrue(check_level_delete(self.case_unassigned.level))

    def test_check_attribute(self):
        self.assertFalse(check_attribute_delete(self.case_legit.attribute))
        self.assertTrue(check_attribute_delete(self.case_unassigned.attribute))


class DeleteServiceTest(TestCase):
    def test_level_delete(self):
        case_legit, case_unassigned = case_set_up()

        level_id = case_unassigned.level.id
        attributes_id = set(case_unassigned.level.attribute_set.values_list('id', flat=True))

        self.assertFalse(perform_level_delete(case_legit.level))
        self.assertTrue(perform_level_delete(case_unassigned.level))
        self.assertTrue(not Level.objects.filter(id=level_id))
        self.assertTrue(not Attribute.objects.filter(id__in=attributes_id))

    def test_attribute_delete(self):
        case_legit, case_unassigned = case_set_up()

        attribute_id = case_unassigned.attribute.id

        self.assertFalse(perform_attribute_delete(case_legit.attribute))
        self.assertTrue(perform_attribute_delete(case_unassigned.attribute))

        self.assertTrue(not Attribute.objects.filter(id=attribute_id))
