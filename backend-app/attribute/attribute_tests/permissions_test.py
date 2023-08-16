from django.test import TestCase
from attribute.permissions import LevelPermission, AttributePermission
from .mock_attribute import case_set_up


class LevelPermissionTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        [case, _] = case_set_up()
        LevelPermissionTest.case = case

    def test_get_request_permission(self):
        request = type('request', (object, ), {'method': 'GET', 'user': self.case.user})
        view = type('view', (object, ), {'kwargs': {'levelID': self.case.level.uid}})

        self.assertFalse(LevelPermission().has_permission(request, view))

        self.case.project.user_edit.add(self.case.user.id)

        self.assertTrue(LevelPermission().has_permission(request, view))

    def test_delete_request_permission(self):
        request = type(
            'request',
            (object, ),
            {
                'method': 'DELETE',
                'user': self.case.user,
                'data': {'id_set': (self.case.level.uid,)}
            }
        )
        view = type('view', (object, ), {'kwargs': {'levelID': self.case.level.uid}})

        self.assertFalse(LevelPermission().has_permission(request, view), self.case.user.project_edit.all())

        self.case.project.user_edit.add(self.case.user.id)

        self.assertTrue(LevelPermission().has_permission(request, view))


class AttributePermissionTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        [case, _] = case_set_up()
        AttributePermissionTest.case = case

    def test_get_request_permission(self):
        request = type(
            'request',
            (object, ),
            {'method': 'GET', 'user': self.case.user}
        )
        view = type('view', (object, ), {'kwargs': {'attributeID': self.case.attribute.id}})

        self.assertFalse(AttributePermission().has_permission(request, view))

        self.case.project.user_edit.add(self.case.user.id)

        self.assertTrue(AttributePermission().has_permission(request, view))

    def test_delete_request_permission(self):
        request = type(
            'request',
            (object, ),
            {
                'method': 'DELETE',
                'user': self.case.user,
                'data': {'id_set': (self.case.attribute.id,)}
            }
        )
        view = type('view', (object, ), {'kwargs': {'levelID': self.case.attribute.id}})

        self.assertFalse(AttributePermission().has_permission(request, view), self.case.user.project_edit.all())

        self.case.project.user_edit.add(self.case.user.id)

        self.assertTrue(AttributePermission().has_permission(request, view))
