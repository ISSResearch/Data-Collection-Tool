from django.test import TestCase
from attribute.attribute_tests.mock_attribute import MockCase
from file.services import (
    FileUploader,
    StatsServices,
    ViewSetServices,
    _annotate_files
)
from json import dumps
from attribute.models import AttributeGroup
from file.models import File
from project.models import Project


class ViewServicesTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()

    def test_prevent(self): self.assertFalse(1)


class AnnotationTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.case_empty = MockCase()
        cls.case_empty.project.file_set.set([])
        cls.request = lambda _, pid, fset: {"project_id": pid, "file_ids": fset}

    def test_annotate_files(self):
        res_no_proj, code_no_proj = _annotate_files(self.request(9999, []))
        res_empty, code_empty = _annotate_files(
            self.request(self.case_empty.project.id, [1,2])
        )
        res, code = _annotate_files(
            self.request(self.case.project.id, [self.case.file_.id])
        )

        self.assertTrue(code == code_empty == code_no_proj == 202)
        self.assertTrue(res_no_proj["annotated"] == res_empty["annotated"] == 0)
        self.assertTrue(res_no_proj["annotation"] == res_empty["annotation"] == [])

class StatsServiceTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.case = MockCase()
        cls.empty_project = Project.objects.create(name="some")

    def test_from_attribute(self):
        empty_res, empty_code = StatsServices.from_attribute(self.empty_project.id)
        no_proj_res, no_proj_code = StatsServices.from_attribute(9999)
        res, code = StatsServices.from_attribute(self.case.project.id)

        check_against = {
            'attribute__attributegroup__file__file_type': self.case.file_.file_type,
            'attribute__attributegroup__file__status': self.case.file_.status,
            'attribute__id': self.case.attribute.id,
            'attribute__name': self.case.attribute.name,
            'attribute__parent': self.case.attribute.parent,
            'count': self.case.file_.attributegroup_set.first().attribute.count(),
            'name': self.case.level.name,
            'order': self.case.level.order
        }

        self.assertTrue(empty_code == code == no_proj_code == 200)
        self.assertTrue(empty_res == no_proj_res == [])

        self.assertEqual(len(res), self.case.project.file_set.count())
        self.assertEqual(
            set(res[0].keys()),
            set(StatsServices._ATTRIUBE_QUERY_VALUES).union(["count"])
        )
        self.assertEqual(res[0], check_against)

    def test_from_user(self):
        empty_res, empty_code = StatsServices.from_user(self.empty_project.id)
        no_proj_res, no_proj_code = StatsServices.from_user(9999)
        res, code = StatsServices.from_user(self.case.project.id)

        check_against = {
            "author_id": self.case.user.id,
            "author__username": self.case.user.username,
            "status": self.case.file_.status,
            "file_type": self.case.file_.file_type,
            "count": self.case.project.file_set.count()
        }

        self.assertTrue(empty_code == code == no_proj_code == 200)
        self.assertTrue(empty_res == no_proj_res == [])

        self.assertEqual(len(res), self.case.project.file_set.count())
        self.assertEqual(
            set(res[0].keys()),
            set(StatsServices._USER_QUERY_VALUES).union(["count"])
        )
        self.assertEqual(res[0], check_against)


class FileUploaderTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.base_check = False
        cls.file_data = {
            "name": "blog3",
            "extension": "png",
            "type": "image",
            "atrsGroups": [[cls.case.attribute.id]]
        }
        cls.post = type(
            'POST',
            (object,),
            {'getlist': lambda x: [dumps(cls.file_data)]}
        )
        cls.request = type(
            'request',
            (object,),
            {'user': cls.case.user, 'POST': cls.post}
        )

    def setUp(self):
        self.uploader = FileUploader(self.request, self.case.project.id)
        if not self.base_check: self._base_check()

    def test_assing_groups(self):
        res = self.uploader._assign_groups(self.case.file_, 1)
        self.assertEqual(res, [])
        self.assertEqual(self.uploader.groups_taken, 1)

        groups = AttributeGroup.objects.bulk_create(
            {AttributeGroup() for _ in range(3)}
        )
        self.uploader.free_attributegroups = list(groups)
        res_2 = self.uploader._assign_groups(self.case.file_, 2)

        self.assertTrue(all([
            self.case.file_ == group.file
            for group in groups[self.uploader.groups_taken:]
        ]))
        self.assertTrue(self.case.file_ != groups[0].file)

        self.assertEqual(len(res_2), 2)

    def test_form_instances(self):
        meta = {**self.file_data}
        del meta["atrsGroups"]
        self._form_instances_mixin(meta)
        self._form_instances_mixin({**meta, "atrsGroups": []})
        self._form_instances_mixin({**meta, "atrsGroups": [1,2]})

    def test_set_created(self):
        self.assertTrue(
            self.uploader.created_files
            == self.uploader.new_instances
            == []
        )

        self.uploader.new_instances = [(1,2,3)] * 3
        self.uploader.set_created()

        self.assertEqual(self.uploader.created_files, [1] * 3)

    def test_assign_attributes(self):
        groups = AttributeGroup.objects.bulk_create(
            {AttributeGroup() for _ in range(1)}
        )
        self.uploader.free_attributegroups = list(groups)
        res = self.uploader._form_instances(self.file_data)
        self.uploader.new_instances = [res]

        self.uploader.assign_attributes()

        self.assertEqual(
            res[1][0].attribute.count(),
            len(self.file_data["atrsGroups"])
        )

    def test_write_instances(self):
        groups = AttributeGroup.objects.bulk_create(
            {AttributeGroup() for _ in range(1)}
        )
        self.uploader.free_attributegroups = list(groups)
        res = self.uploader._form_instances(self.file_data)
        self.uploader.new_instances = [res]

        self.assertIsNone(res[0].id)
        self.uploader.write_instances()
        self.assertIsNotNone(res[0].id)

    def test_gather_instances(self):
        temp = self.uploader.files_meta
        self.assertEqual(self.uploader.new_instances, [])
        self._gather_instances_mixin([])
        self._gather_instances_mixin(temp)

    def test_get_groups(self):
        init_ag_count = AttributeGroup.objects.count()
        self.assertEqual(self.uploader.free_attributegroups, [])
        temp = self.uploader.files_meta

        self._get_groups_mixin([])
        self._get_groups_mixin(temp)

        self.assertEqual(
            init_ag_count + sum([len(m["atrsGroups"]) for m in temp]),
            AttributeGroup.objects.count()
        )

    def test_proceed_upload(self):
        temp = self.uploader.files_meta
        self.uploader.files_meta = None
        self.assertFalse(self.uploader.proceed_upload())

        self.uploader.files_meta = temp

        expected_count = sum([
            len(meta["atrsGroups"])
            for meta in self.uploader.files_meta
        ])

        self.assertTrue(self.uploader.proceed_upload())

        self.assertTrue(
            len(self.uploader.free_attributegroups)
            == len(self.uploader.new_instances)
            == len(self.uploader.created_files)
            == expected_count
        )

        self.assertEqual(
            self.uploader.free_attributegroups[0].file,
            self.uploader.created_files[0]
        )
        self.assertEqual(
            self.uploader.free_attributegroups[0].attribute.first().id,
            self.case.attribute.id
        )

    def _get_groups_mixin(self, meta):
        self.uploader.files_meta = meta
        self.uploader.get_free_attributegroups()
        self.assertEqual(len(self.uploader.free_attributegroups), len(meta))

    def _gather_instances_mixin(self, meta):
        self.uploader.files_meta = meta
        self.uploader.gather_instances()
        self.assertEqual(len(self.uploader.new_instances), len(meta))

    def _form_instances_mixin(self, meta):
        groups = AttributeGroup.objects.bulk_create(
            {AttributeGroup() for _ in range(2)}
        )
        self.uploader.free_attributegroups = list(groups)

        res_file, res_groups, res_meta = self.uploader._form_instances(meta)

        self.assertEqual(res_meta, meta.get("atrsGroups", []))
        self.assertTrue(isinstance(res_file, File))
        self.assertEqual(
            res_file.file_name,
            f'{meta["name"]}.{meta["extension"]}'
        )
        self.assertEqual(res_file.file_type, meta["type"])
        self.assertEqual(len(res_groups), len(meta.get("atrsGroups", [])))
        self.assertTrue(all([res_file == g.file for g in res_groups]))

    def _base_check(self):
        self.assertEqual(self.uploader.project_id, self.case.project.id)
        self.assertEqual(self.uploader.author_id, self.case.user.id)
        self.assertEqual(self.uploader.files_meta, [self.file_data])

        self.assertEqual(self.uploader.free_attributegroups, list())
        self.assertEqual(self.uploader.new_instances, list())
        self.assertEqual(self.uploader.created_files, list())
        self.assertEqual(self.uploader.groups_taken, 0)

        self.base_check = True
