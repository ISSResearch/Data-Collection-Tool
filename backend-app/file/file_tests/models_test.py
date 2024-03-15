from django.test import TestCase
from attribute.attribute_tests.mock_attribute import MockCase
from file.models import File
from attribute.models import Attribute
from uuid import uuid4


class FileModelTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()

    def test_create_file(self):
        init_count = self.case.project.file_set.count()
        credentials = {
            "id": str(uuid4())[:24],
            "file_name": 'new_test.png',
            "file_type": 'image',
            "project": self.case.project,
            "author": self.case.user
        }

        new_file = File.objects.create(**credentials)

        credentials["author"] = credentials["author"].id
        credentials["project"] = credentials["project"].id

        self.assertEqual(
            set(
                File.objects
                .values_list(
                    "id",
                    "file_name",
                    "file_type",
                    "project",
                    "author",
                    "status",
                    "is_downloaded",
                    "validator",
                )
                .get(id=new_file.id)
            ),
            set(credentials.values()).union({'v', False, None})
        )
        self.assertEqual(init_count + 1, self.case.project.file_set.count())

    def test_get_ids(self):
        result = self.case.file_._get_attribute_ids(
            self.case.file_.attributegroup_set.values_list("uid", "attribute")
        )
        expected = {
            self.case.attributegroup.uid: list(
                self.case
                    .attributegroup
                    .attribute
                    .values_list("id", flat=True)
            )
        }

        self.assertEqual(result, expected)

    def test_handle_group_change(self):
        new_attr = Attribute.objects.create(
            name='new_atr',
            project=self.case.project,
            level=self.case.level
        )

        init_state = self.case.file_.attributegroup_set.values_list("uid", "attribute")

        self.assertEqual(len(init_state), 1)

        self._group_change_test_mixin(
            self.case.file_,
            (str(init_state.first()[0]), [new_attr.id])
        )
        self._group_change_test_mixin(
            self.case.file_,
            (str(init_state.first()[0]), [new_attr.id, self.case.attribute.id])
        )
        self._group_change_test_mixin(self.case.file_, ("new", [new_attr.id]), True)

        self.assertEqual(
            len(init_state) + 1,
            len(set(self.case.file_.attributegroup_set.values_list("uid", flat=True))),
        )

    def test_update_attributes(self):
        new_attr = Attribute.objects.create(
            name='new_atr',
            project=self.case.project,
            level=self.case.level
        )
        init_state = self.case.file_.attributegroup_set.values_list("uid", "attribute")

        self.assertEqual(len(init_state), 1)
        key = str(init_state.first()[0])

        self.case.file_.update_attributes({"new": [new_attr.id, self.case.attribute.id]})

        self.assertTrue(
            key not in
            {
                str(key) for key, val in
                self.case.file_.attributegroup_set.values_list("uid", "attribute")
            }
        )

    def _group_change_test_mixin(self, file, group, new=False):
        state = file.attributegroup_set.values_list("uid", "attribute")

        file._handle_group_change(
            group,
            file.attributegroup_set.all(),
            file._get_attribute_ids(state)
        )

        new_state = file._get_attribute_ids(
            [file.attributegroup_set.values_list("uid", "attribute").last()]
            if new else
            file.attributegroup_set.values_list("uid", "attribute")
        )
        key, val = tuple(new_state.items())[0]

        if new: self.assertEqual(val, group[1])
        else: self.assertEqual((str(key), val), group)
