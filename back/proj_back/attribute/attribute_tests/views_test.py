from django.test import TestCase
from .mock_attribute import case_set_up
from user.user_tests.mock_user import MOCK_CLASS


class LevelViewsetTest(TestCase, MOCK_CLASS):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        case_legit, case_unassigned = case_set_up()
        LevelViewsetTest.case_legit = case_legit
        LevelViewsetTest.case_unassigned = case_unassigned
        LevelViewsetTest.user = MOCK_CLASS.create_admin_user()

    def test_get_level(self):
        self.client.force_login(self.user)

        legit_check_request = self.client.get(
            f'/api/attributes/levels/{self.case_legit.level.id}/'
        )
        unassigned_check_request = self.client.get(
            f'/api/attributes/levels/{self.case_unassigned.level.id}/'
        )
        unexisted_check_request = self.client.get(
            f'/api/attributes/levels/123987/'
        )

        self.assertTrue(legit_check_request.status_code == 403, legit_check_request.json)
        self.assertTrue(unassigned_check_request.status_code == 200)
        self.assertTrue(unexisted_check_request.status_code == 404)
        self.assertTrue(unassigned_check_request.data['is_safe'])
        self.assertTrue(legit_check_request.data == 'attribute violation')
        self.assertTrue(unexisted_check_request.data == 'query level does not exist')

    def test_delete_level(self):
        self.client.force_login(self.user)

        unassigned_request = self.client.delete(
            '/api/attributes/levels/',
            data={'id_set': [self.case_unassigned.level.id]},
            content_type='application/json'
        )
        legit_request = self.client.delete(
            '/api/attributes/levels/',
            data={'id_set': [self.case_legit.level.id]},
            content_type='application/json'
        )
        unexisted_request = self.client.delete(
            '/api/attributes/levels/',
            data={'id_set': [29854]},
            content_type='application/json'
        )

        self.assertTrue(unassigned_request.status_code == 200)
        self.assertTrue(legit_request.status_code == 206)
        self.assertTrue(unexisted_request.status_code == 206)
        self.assertTrue(unassigned_request.data[self.case_unassigned.level.id])
        self.assertTrue(
            legit_request.data[self.case_legit.level.id],
            'attribute violation'
        )
        self.assertTrue(
            unexisted_request.data[29854],
            'query level does not exist'
        )


class AttributeViewsetTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        case_legit, case_unassigned = case_set_up()
        AttributeViewsetTest.case_legit = case_legit
        AttributeViewsetTest.case_unassigned = case_unassigned
        AttributeViewsetTest.user = MOCK_CLASS.create_admin_user()

    def test_get_attribute(self):
        self.client.force_login(self.user)

        legit_check_request = self.client.get(
            f'/api/attributes/attributes/{self.case_legit.attribute.id}/'
        )
        unassigned_check_request = self.client.get(
            f'/api/attributes/attributes/{self.case_unassigned.attribute.id}/'
        )
        unexisted_check_request = self.client.get(
            f'/api/attributes/attributes/123987/'
        )

        self.assertTrue(legit_check_request.status_code == 403)
        self.assertTrue(unassigned_check_request.status_code == 200)
        self.assertTrue(unexisted_check_request.status_code == 404)
        self.assertTrue(unassigned_check_request.data['is_safe'])
        self.assertTrue(legit_check_request.data == 'attribute violation')
        self.assertTrue(unexisted_check_request.data == 'query attribute does not exist')

    def test_delete_attribute(self):
        self.client.force_login(self.user)

        unassigned_request = self.client.delete(
            '/api/attributes/attributes/',
            data={'id_set': [self.case_unassigned.attribute.id]},
            content_type='application/json'
        )
        legit_request = self.client.delete(
            '/api/attributes/attributes/',
            data={'id_set': [self.case_legit.attribute.id]},
            content_type='application/json'
        )
        unexisted_request = self.client.delete(
            '/api/attributes/attributes/',
            data={'id_set': [29854]},
            content_type='application/json'
        )

        self.assertTrue(unassigned_request.status_code == 200)
        self.assertTrue(legit_request.status_code == 206)
        self.assertTrue(unexisted_request.status_code == 206)
        self.assertTrue(unassigned_request.data[self.case_unassigned.attribute.id])
        self.assertTrue(
            legit_request.data[self.case_legit.attribute.id],
            'attribute violation'
        )
        self.assertTrue(
            unexisted_request.data[29854],
            'query attribute does not exist'
        )
