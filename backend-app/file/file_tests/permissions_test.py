from django.test import TestCase
from file.permissions import FilePermission
from attribute.attribute_tests.mock_attribute import case_set_up


class FilePermissionTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        [case, _] = case_set_up()
        FilePermissionTest.case = case

    def _test_mixin(self, method, view_kwargs):
        request = type('request', (object, ), {'method': method, 'user': self.case.user})
        view = type('view', (object, ), {'kwargs': view_kwargs})

        self.assertFalse(FilePermission().has_permission(request, view))

        if method in {'GET'}:
            self.case.project.user_view.add(self.case.user.id)
        if method in {'PATCH'}:
            self.case.project.user_validate.add(self.case.user.id)
        if method in {'POST', 'DELETE'}:
            self.case.project.user_upload.add(self.case.user.id)

        self.assertTrue(FilePermission().has_permission(request, view))

    def test_get_permission(self):
        self._test_mixin('GET', {'fileID': self.case.file_.id})

    def test_patch_permission(self):
        self._test_mixin('PATCH', {'fileID': self.case.file_.id})

    def test_post_permission(self):
        self._test_mixin('POST', {'projectID': self.case.project.id})

    def test_delete_permission(self):
        self._test_mixin('DELETE', {'projectID': self.case.project.id})
