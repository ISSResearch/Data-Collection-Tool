from django.test import TestCase
from attribute.attribute_tests.mock_attribute import case_set_up
from project.permissions import (
    ProjectsPermission,
    ProjectPermission,
    ProjectViewPermission,
    ProjectStatsPermission
)


class ProjectsPermissionTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        [case, _] = case_set_up()
        ProjectsPermissionTest.case = case

    def test_get_permission(self):
        request = type('request', (object, ), {'method': 'GET', 'user': self.case.user})

        self.assertTrue(ProjectsPermission().has_permission(request, None))

    def test_post_permission(self):
        request = type('request', (object, ), {'method': 'POST', 'user': self.case.user})

        self.assertFalse(ProjectsPermission().has_permission(request, None))

        self.case.user.is_superuser = True
        self.case.user.save()

        self.assertTrue(ProjectsPermission().has_permission(request, None))


class ProjectPermissionTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        [case, _] = case_set_up()
        ProjectPermissionTest.case = case

    def _test_mixin(self, method):
        request = type('request', (object, ), {'method': method, 'user': self.case.user})
        view = type('view', (object, ), {'kwargs': {'pk': self.case.project.id}})

        if method == 'GET':
            self.assertTrue(ProjectPermission().has_permission(request, view))
            return

        self.assertFalse(ProjectPermission().has_permission(request, view))

        self.case.project.user_edit.add(self.case.user.id)

        self.assertTrue(ProjectPermission().has_permission(request, view))

    def test_get_permission(self): self._test_mixin('GET')

    def test_patch_permission(self): self._test_mixin('PATCH')

    def test_delete_permission(self): self._test_mixin('DELETE')


class ProjectViewPermissionTest(TestCase):
    def test_perission(self):
        [case, _] = case_set_up()

        request = type('request', (object, ), {'user': case.user})
        view = type('view', (object, ), {'kwargs': {'pk': case.project.id}})

        self.assertFalse(ProjectViewPermission().has_permission(request, view))

        case.project.user_visible.add(case.user.id)

        self.assertTrue(ProjectViewPermission().has_permission(request, view))


class ProjectStatsPermissionTest(TestCase):
    def test_perission(self):
        [case, _] = case_set_up()

        request = type('request', (object, ), {'user': case.user})
        view = type('view', (object, ), {'kwargs': {'projectID': case.project.id}})

        self.assertFalse(ProjectStatsPermission().has_permission(request, view))

        case.project.user_stats.add(case.user.id)

        self.assertTrue(ProjectStatsPermission().has_permission(request, view))
