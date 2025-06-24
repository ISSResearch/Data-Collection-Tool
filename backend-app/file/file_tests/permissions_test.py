from django.test import TestCase
from file.permissions import FilePermission
from attribute.attribute_tests.mock_attribute import MockCase
from user.models import CustomUser


class FilePermissionTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.admin = CustomUser.objects.create(
            username="namexxxxx",
            password="password",
            is_superuser=True
        )

    def test_get_permission(self):
        self._test_mixin('GET', {'fileID': self.case.file_.id})

    def test_patch_permission(self):
        self._test_mixin('PATCH', {'fileID': self.case.file_.id})

    def test_post_permission(self):
        self._test_mixin('POST', {'projectID': self.case.project.id})

    def test_delete_permission(self):
        self._test_mixin('DELETE', {'projectID': self.case.project.id})

    def _test_mixin(self, method, view_kwargs):
        req = lambda user: type(
            'request',
            (object,),
            {'method': method, 'user': user}
        )
        view = type('view', (object, ), {'kwargs': view_kwargs})

        self.assertTrue(FilePermission().has_permission(req(self.admin), view))

        self.assertFalse(FilePermission().has_permission(req(self.case.user), view))

        if method == 'GET':
            self.case.project.user_view.add(self.case.user.id)
        if method == 'PATCH':
            self.case.project.user_validate.add(self.case.user.id)
        if method in {'POST', 'DELETE'}:
            self.case.project.user_upload.add(self.case.user.id)

        self.assertTrue(FilePermission().has_permission(req(self.case.user), view))
