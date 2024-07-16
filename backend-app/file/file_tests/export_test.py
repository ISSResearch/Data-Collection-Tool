from file.export import XLS, JSON, CSV
from file.services import StatsServices
from django.test import TestCase
from attribute.attribute_tests.mock_attribute import MockCase
from json import loads


class ExportTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.attr_stat, _ = StatsServices.from_attribute(cls.case.project.id)
        cls.user_stat, _ = StatsServices.from_user(cls.case.project.id)

    def test_xls(self):
        #attr_res = XLS(self.attr_stat, "attribute").into_response()
        #user_res = XLS(self.user_stat, "user").into_response()
        # TODO:

    def test_csv(self):
        attr_res = CSV(self.attr_stat, "attribute").into_response()
        user_res = CSV(self.user_stat, "user").into_response()

        attributes = attr_res.read().decode().split("\n")
        users = user_res.read().decode().split("\n")

        self.assertTrue(len(attributes) == len(users) == 3)
        # TODO:

    def test_json(self):
        attr_res = JSON(self.attr_stat, 0).into_response()
        user_res = JSON(self.user_stat, 0).into_response()
        self.assertEqual(self.attr_stat, loads(attr_res.read().decode()))
        self.assertEqual(self.user_stat, loads(user_res.read().decode()))
