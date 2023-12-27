from django.test import TestCase
from .mock_attribute import case_set_up
from attribute.models import Attribute, Level
from attribute.services import ViewMixIn


class MixinUtilsTest(TestCase, ViewMixIn):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case_legit, cls.case_unassigned = case_set_up()

    def test_can_delete(self):
        self._can_delete_mixin(
            Level,
            self.case_legit.level,
            self.case_unassigned.level
        )
        self._can_delete_mixin(
            Attribute,
            self.case_legit.attribute,
            self.case_unassigned.attribute
        )

    def test_check_intersection(self):
        self._check_intersection_mixin(
            Level,
            self.case_legit.level,
            self.case_unassigned.level
        )
        self._check_intersection_mixin(
            Attribute,
            self.case_legit.attribute,
            self.case_unassigned.attribute
        )

    def _can_delete_mixin(self, model, item_err, item_ok):
        self.model = model
        result_f, code_f = self._can_delete_response(8888)
        result_err, code_err = self._can_delete_response(item_err.id)
        result_ok, code_ok = self._can_delete_response(item_ok.id)

        self.assertEqual(code_f, 404)
        self.assertFalse(result_f["is_safe"])
        self.assertEqual(result_f["message"], "queried id does not exist")

        self.assertEqual(code_err, 403)
        self.assertFalse(result_err["is_safe"])
        self.assertEqual(result_err["message"], "attribute violation")

        self.assertEqual(code_ok, 200)
        self.assertTrue(result_ok["is_safe"])
        self.assertIsNone(result_ok.get("message"))

    def _check_intersection_mixin(self, model, item_err, item_ok):
       self.model = model

       self.assertTrue(self._check_intersection(item_err))
       self.assertFalse(self._check_intersection(item_ok))


class MixinActionTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case_legit, cls.case_unassigned = case_set_up()
