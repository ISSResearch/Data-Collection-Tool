from django.test import TestCase
from .mock_attribute import case_set_up
from user.models import CustomUser
from attribute.models import Attribute, Level
from time import time


class TestMixin(TestCase):
    model: Level | Attribute

    def setUp(self):
        self.case_legit, self.case_unassigned = case_set_up()

        self.collector = CustomUser.objects.create(
            username="name" + str(time()),
            password="password"
        )
        self.new_collector = CustomUser.objects.create(
            username="npuname" + str(time()),
            password="pass"
        )
        self.admin = CustomUser.objects.create(
            username="adminUser123" + str(time()),
            password="pass",
            is_superuser=True
        )

        self.case_legit.project.user_edit.add(self.collector.id)
        self.case_unassigned.project.user_edit.add(self.collector.id)

    def test_get(self):
        self._get_test_mixin(self.collector)
        self._get_test_mixin(self.new_collector, False)
        self._get_test_mixin(self.admin)

    def test_delete_collector(self):
        self._delete_test_mixin(self.collector)
        self._delete_test_mixin(self.new_collector, False)

    def test_delte_admin(self):
        self._delete_test_mixin(self.admin)

    @property
    def _url(self): return f"/api/attributes/{self.model._meta.db_table}s/"

    def _get_test_mixin(self, user, user_legit=True):
        user.emit_token()

        delete_id = lambda case: \
            case \
            .__dict__[self.model._meta.db_table] \
            .__dict__["uid" if self.model is Level else "id"]

        ok = self.client.get(
            f"{self._url}{delete_id(self.case_unassigned)}/",
            HTTP_AUTHORIZATION="Bearer " + user.token
        )
        err = self.client.get(
            f"{self._url}{delete_id(self.case_legit)}/",
            HTTP_AUTHORIZATION="Bearer " + user.token
        )
        err_u = self.client.get(
            f"{self._url}900009/",
            HTTP_AUTHORIZATION="Bearer " + user.token
        )

        if not user_legit: self.assertTrue(
            ok.status_code
            == err.status_code
            == err_u.status_code
            == 403
        )
        else:
            self.assertEqual(ok.status_code, 200)
            self.assertEqual(err.status_code, 403)
            self.assertEqual(err_u.status_code, 404 if user.is_superuser else 403)

            self.assertTrue(ok.data["is_safe"])
            self.assertFalse(err.data["is_safe"])

            self.assertEqual(err.data["message"], "attribute violation")

    def _delete_test_mixin(self, user, user_legit=True):
        user.emit_token()

        delete_id = lambda case: \
            case \
            .__dict__[self.model._meta.db_table] \
            .__dict__["uid" if self.model is Level else "id"]

        ok = self.client.delete(
            self._url,
            data={'id_set': [delete_id(self.case_unassigned)]},
            content_type='application/json',
            HTTP_AUTHORIZATION="Bearer " + user.token
        )
        err = self.client.delete(
            self._url,
            data={'id_set': [delete_id(self.case_legit)]},
            content_type='application/json',
            HTTP_AUTHORIZATION="Bearer " + user.token
        )
        err_u = self.client.delete(
            self._url,
            data={'id_set': [298541231312312]},
            content_type='application/json',
            HTTP_AUTHORIZATION="Bearer " + user.token
        )

        if not user_legit: self.assertTrue(
            ok.status_code
            == err.status_code
            == err_u.status_code
            == 403
        )
        else:
            self.assertEqual(ok.status_code, 202)
            self.assertTrue(err.status_code == err_u.status_code == 206)
            self.assertTrue(ok.data[delete_id(self.case_unassigned)])
            self.assertTrue(
                err.data[delete_id(self.case_legit)],
                'attribute violation'
            )
            self.assertEqual(0, (
                self.case_unassigned.project.level_set.count()
                if self.model is Level else
                self.case_unassigned.project.attribute_set.count()
            ))


class AttributeViewSetTest(TestMixin):
    model = Attribute


class LevelViewSetTest(TestMixin):
    model = Level
