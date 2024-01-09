from django.test import TestCase
from attribute.permissions import (
    LevelPermission,
    AttributePermission,
    PermissionMixIn,
    Attribute,
    Level
)
from user.models import CustomUser
from .mock_attribute import case_set_up, MockCase


class PermissionMixinTest(TestCase, PermissionMixIn):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.new_collector = CustomUser.objects.create(
            username="npuname",
            password="pass"
        )
        cls.case.collector = CustomUser.objects.create(
            username="name",
            password="password"
        )
        cls.case.project.user_edit.add(cls.case.collector.id)

    def test_lookup(self):
        self._lookup_mixin(self.case.level.uid, Level)
        self._lookup_mixin(self.case.attribute.id, Attribute)

    def test_has_permission(self):
        self.case.user.is_superuser = True
        self.case.user.save()

        self._permission_mixin(self.case.level.uid, Level)
        self._permission_mixin(self.case.attribute.id, Attribute)

    def _permission_mixin(self, item_id, model):
        self.model = model

        self.assertTrue(self.has_permission(
            *self._form_args("GET", item_id, self.case.user)
        ))
        self.assertTrue(self.has_permission(
            *self._form_args("DELETE", item_id, self.case.user)
        ))

        self.assertTrue(self.has_permission(
            *self._form_args("GET", item_id, self.case.collector)
        ))
        self.assertTrue(self.has_permission(
            *self._form_args("DELETE", item_id, self.case.collector)
        ))

        self.assertFalse(self.has_permission(
            *self._form_args("GET", item_id, self.new_collector)
        ))
        self.assertFalse(self.has_permission(
            *self._form_args("DELETE", item_id, self.new_collector)
        ))

    def _lookup_mixin(self, item_id, model):
        self.model = model

        get_result = self._get_lookup(
            *self._form_args("GET", item_id, self.case.user)
        )
        delete_result = self._get_lookup(
            *self._form_args("DELETE", item_id, self.case.user)
        )

        field = "id" if model == Attribute else "uid"

        self.assertEqual(list(get_result.keys())[0], field)
        self.assertEqual(list(delete_result.keys())[0], field + "__in")

        self.assertEqual(list(get_result.values())[0], item_id)
        self.assertEqual(list(delete_result.values())[0], (item_id, ))


    def _form_args(self, method, item_id, user):
        if method not in {"GET", "DELETE"}: raise AttributeError

        _request = type(
            'request',
            (object, ),
            {'user': user, 'method': method}
        )
        _view = type('view', (object, ), {})

        request, view = _request(), _view()

        if method == "GET": view.kwargs = {"item_id" : item_id}
        else: request.data = {"id_set": (item_id,)}

        return request, view
