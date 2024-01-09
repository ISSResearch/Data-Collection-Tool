from django.test import TestCase
from .mock_attribute import case_set_up
from attribute.models import Attribute, Level
from attribute.services import ViewMixIn


class MixinUtilsTest(TestCase, ViewMixIn):
    def setUp(self):
        self.case_legit, self.case_unassigned = case_set_up()

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

    def test_perform_delete_level(self):
        self.model = Level

        legit_count = self.case_legit.project.level_set.count()
        legit_count_attribute = self.case_legit.project.attribute_set.count()

        self.assertFalse(self._perform_delete(self.case_legit.level.uid))
        self.assertTrue(self._perform_delete(self.case_unassigned.level.uid))

        self.assertEqual(legit_count, self.case_legit.project.level_set.count())
        self.assertEqual(
            legit_count_attribute,
            self.case_legit.project.attribute_set.count()
        )

        self.assertEqual(self.case_unassigned.project.level_set.count(), 0)
        self.assertEqual(self.case_unassigned.project.attribute_set.count(), 0)

    def test_perform_delete_attribute(self):
        self.model = Attribute

        legit_count = self.case_legit.project.attribute_set.count()

        self.assertFalse(self._perform_delete(self.case_legit.attribute.id))
        self.assertTrue(self._perform_delete(self.case_unassigned.attribute.id))

        self.assertEqual(legit_count, self.case_legit.project.attribute_set.count())
        self.assertEqual(self.case_unassigned.project.attribute_set.count(), 0)

    def test_delete_items_level_solo(self): self._delete_items_mixin(Level, True)

    def test_delete_items_level(self): self._delete_items_mixin(Level)

    def test_delete_items_attribute_solo(self):
        self._delete_items_mixin(Attribute, True)

    def test_delete_items_attribute(self): self._delete_items_mixin(Attribute)

    def _delete_items_mixin(self, model, solo=False):
        self.model = model
        legit_level_count = self.case_legit.project.level_set.count()
        legit_attribute_count = self.case_legit.project.level_set.count()
        unasgn_level_count = self.case_unassigned.project.level_set.count()

        get_id = lambda case: \
            case \
            .__dict__[model._meta.db_table] \
            .__dict__["uid" if model is Level else "id"]

        id_unassigned = get_id(self.case_unassigned)
        id_legit = get_id(self.case_legit)
        id_unexisted = 55555555

        id_set = {"id_set": [id_unassigned]}
        if not solo:
            id_set["id_set"].append(id_legit)
            id_set["id_set"].append(id_unexisted)

        result, code = self._delete_items(id_set)

        self.assertEqual(code, 202 if solo else 206)

        self.assertEqual(
            (
                {id_unassigned: True} if solo
                else {
                    id_unassigned: True,
                    id_legit: "attribute violation",
                   id_unexisted: "queried id does not exist"
                }
            ),
            result
        )

        self.assertEqual(legit_level_count, self.case_legit.project.level_set.count())
        self.assertEqual(legit_attribute_count, self.case_legit.project.level_set.count())
        self.assertEqual(
            self.case_unassigned.project.level_set.count(),
            0 if model == Level else unasgn_level_count
        )
        self.assertEqual(self.case_unassigned.project.attribute_set.count(), 0)

    def _can_delete_mixin(self, model, item_err, item_ok):
        self.model = model

        get_id = lambda item: item.__dict__["uid" if model is Level else "id"]

        result_f, code_f = self._can_delete_response(8888)
        result_err, code_err = self._can_delete_response(get_id(item_err))
        result_ok, code_ok = self._can_delete_response(get_id(item_ok))

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


class MixinActionTest(TestCase, ViewMixIn):
    def setUp(self):
        self.model = Level
        self.case_legit, self.case_unassigned = case_set_up()

    def test_get(self):
        result_err = self.get({}, self.case_legit.level.uid)
        result_une = self.get({}, 5555555555)
        result_ok = self.get({}, self.case_unassigned.level.uid)

        self.assertEqual(result_err.status_code, 403)
        self.assertEqual(result_une.status_code, 404)
        self.assertFalse(all([
            result_err.data["is_safe"],
            result_une.data["is_safe"]
        ]))
        self.assertTrue(result_ok.data["is_safe"])

    def test_delete(self):
        return
        result_err = self.delete(
            type("request", (object, ), {"data": [self.case_legit.level.id]})
        )
        result_une = self.delete(
            type("request", (object, ), {"data": [6666655656]})
        )
        result_ok = self.delete(
            type("request", (object, ), {"data": [self.case_unassigned.level.id]})
        )

        self.assertTrue(result_err.status_code == result_une.status_code == 206)
        self.assertEqual(result_ok.status_code, 202)
