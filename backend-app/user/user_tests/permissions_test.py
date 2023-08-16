from django.test import TestCase
from user.permissions import UserPermission
from attribute.attribute_tests.mock_attribute import case_set_up


class UserPermissionTest(TestCase):
    def _test_mixin(self, method):
        [case, _] = case_set_up()

        request = type('request', (object, ), {'user': case.user, 'method': method})
        view = type('view', (object, ), {'kwargs': {'projectID': case.project.id}})

        self.assertFalse(UserPermission().has_permission(request, view))

        case.project.user_edit.add(case.user.id)

        self.assertTrue(UserPermission().has_permission(request, view))

    def test_get_permission(self): self._test_mixin('GET')

    def test_patch_permission(self): self._test_mixin('PATCH')
