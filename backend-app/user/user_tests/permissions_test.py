from django.test import TestCase
from user.permissions import UserPermission
from attribute.attribute_tests.mock_attribute import case_set_up


class UserPermissionTest(TestCase):
    def test_get_permission_edit(self): self._test_mixin('GET', "edit")

    def test_patch_permission_edit(self): self._test_mixin('PATCH', "edit")

    def test_get_permission_view(self): self._test_mixin('GET', "view")

    def test_patch_permission_view(self): self._test_mixin('PATCH', "view")

    def _test_mixin(self, method, permission):
        [case, _] = case_set_up()
        permission_map = {
            "edit": case.project.user_edit,
            "view": case.project.user_view
        }

        request = type('request', (object, ), {'user': case.user, 'method': method})
        view = type('view', (object, ), {'kwargs': {'projectID': case.project.id}})

        self.assertFalse(UserPermission().has_permission(request, view))

        permission_map[permission].add(case.user.id)

        self.assertTrue(UserPermission().has_permission(request, view))
