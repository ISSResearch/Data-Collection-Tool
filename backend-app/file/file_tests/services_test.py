from django.test import TestCase
from attribute.attribute_tests.mock_attribute import MockCase
from file.services import (
    FileUploader,
    StatsServices,
    ViewSetServices,
    _annotate_files
)
from json import dumps
from attribute.models import AttributeGroup, Attribute
from file.models import File
from project.models import Project
from user.models import CustomUser
from uuid import uuid4
from datetime import datetime as dt, timedelta as td
from django.utils import timezone as tz


class ViewServicesTest(TestCase, ViewSetServices):
    date_format: str = "%Y-%m-%d"

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.admin = CustomUser.objects.create(
            username="some123",
            password="pass",
            is_superuser=True
        )

    def test_create_files(self):
        post = type(
            'POST',
            (object,),
            {'get': lambda *x: dumps({
                "fileID": str(uuid4())[:24],
                "name": "blog3",
                "extension": "png",
                "type": "image",
                "atrsGroups": [[self.case.attribute.id]]
            })}
        )
        invalid_post = type(
            'POST',
            (object,),
            {'get': lambda *x: dumps({
                "type": "image",
                "atrsGroups": [[self.case.attribute.id]]
            })}
        )
        request = type(
            'request',
            (object,),
            {'user': self.case.user, 'POST': post}
        )
        invalid_request = type(
            'request',
            (object,),
            {'user': self.case.user, 'POST': invalid_post}
        )
        init_count = self.case.project.file_set.count()

        res, code = self._create_file(self.case.project.id, request)
        res_invalid, code_invalid = self._create_file(111, invalid_request)

        self.assertEqual(code_invalid, 406)
        self.assertFalse(res_invalid["result"])

        self.assertEqual(code, 201)
        self.assertTrue(res["result"])

        self.assertEqual(self.case.project.file_set.count(), init_count + 1)

    def test_get_files(self):
        file1 = File.objects.create(
            id=str(uuid4())[:24],
            file_name="file",
            file_type="video",
            project=self.case.project,
            author=self.case.user
        )
        file2 = File.objects.create(
            id=str(uuid4())[:24],
            file_name="file",
            file_type="image",
            project=self.case.project,
            author=self.admin
        )
        new_attr = Attribute.objects.create(
            name="asd",
            project=self.case.project,
            level=self.case.level
        )
        file1.update_attributes({"asd": [new_attr.id]})
        file1.status = "a"
        file1.save()
        file2.status = "d"
        file2.save()

        self.assertEqual(self.case.project.file_set.count(), 3)

        self._get_mixin(2)
        self._get_mixin(1, query={"card": ["a", "d"]})
        self._get_mixin(1, query={"card": ["a"]})
        self._get_mixin(0, query={"type_": ["image"]})
        self._get_mixin(1, query={"type_": ["video"]})
        self._get_mixin(1, attrs=[new_attr.id])

        self._get_mixin(3, True)
        self._get_mixin(2, True, query={"card": ["a", "d"]})
        self._get_mixin(1, True, query={"card": ["a"]})
        self._get_mixin(1, True, query={"type_": ["image"]})
        self._get_mixin(1, True, query={"type_": ["video"]})
        self._get_mixin(1, True, attrs=[new_attr.id])

    def test_delete_file(self):
        file = File.objects.create(
            id=str(uuid4())[:24],
            file_name="file",
            file_type="ext",
            project=self.case.project,
            author=self.case.user
        )

        init_count = self.case.project.file_set.count()

        res, code = self._delete_file(file.id)
        res_invalid, code_invalid = self._delete_file(123123123)

        self.assertEqual(code_invalid, 400)
        self.assertFalse(res_invalid["deleted"])

        self.assertEqual(code, 202)
        self.assertTrue(res["deleted"])

        self.assertEqual(init_count - 1, self.case.project.file_set.count())

    def test_patch(self):
        init_ag_count = self.case.file_.attributegroup_set.count()
        new_attr = Attribute.objects.create(
            name='asd',
            project=self.case.project,
            level=self.case.level
        )
        request_data = {
            "status": "a",
            'attribute': {
                "asd": [new_attr.id],
                str(self.case.attributegroup.uid): [new_attr.id],
            }
        }
        request = lambda payload={}: type(
            "rq",
            (object,),
            {"data": payload, "user": self.case.user}
        )

        valid_rq_init_date = File.objects.get(id=self.case.file_.id).update_date,

        self.assertIsNone(File.objects.get(id=self.case.file_.id).validator)

        res, code = self._patch_file(self.case.file_.id, request(request_data))
        invalid_res, invalid_code = self._patch_file(self.case.file_.id, request({"status": 123}))

        self.assertEqual(invalid_code, 400)
        self.assertFalse(invalid_res["ok"])
        self.assertIsNotNone(invalid_res.get("errors"))

        self.assertEqual(code, 202)
        self.assertTrue(res["ok"])
        self.assertEqual(
            init_ag_count + 1,
            self.case.file_.attributegroup_set.count()
        )
        self.assertTrue(
            set(
                self.case.file_.attributegroup_set
                    .first()
                    .attribute
                    .values_list("id", flat=True)
            )
            == set(
                self.case.file_.attributegroup_set
                    .last()
                    .attribute
                    .values_list("id", flat=True)
            )
            == {new_attr.id}
        )
        self.assertEqual(
            File.objects.get(id=self.case.file_.id).status,
            "a"
        )
        self.assertNotEqual(
            File.objects.get(id=self.case.file_.id).update_date,
            valid_rq_init_date
        )
        self.assertIsNotNone(File.objects.get(id=self.case.file_.id).validator)

    def test_form_query(self):
        query = {}
        self._form_query_mixin(query)

        query["card"] = [self.case.file_.status]
        self._form_query_mixin(query)

        query["type_"] = ["image"]
        self._form_query_mixin(query)

        query["status"] = "v"
        self._form_query_mixin(query)

        query["downloaded"] = True
        self._form_query_mixin(query)

        query["author"] = self.admin
        self._form_query_mixin(query)

        query["from_"] = dt.now().strftime(self.date_format)
        self._form_query_mixin(query)

        query["to"] = (dt.now() + td(days=1)).strftime(self.date_format)
        self._form_query_mixin(query)

    def _form_query_mixin(self, data={}):
        query, filter = self._get_query(**data)
        res = self._form_query(
            self.case.project.id,
            self.case.user,
            query
        )
        self.assertEqual(res, filter)

    def _get_query(
        self,
        card=[],
        type_=[],
        status="",
        downloaded=False,
        author=[],
        user=None,
        from_="",
        to=""
    ):
        request_query = type(
            "query",
            (object,),
            {
                "get": lambda this, item: getattr(this, item, None),
                "getlist": lambda this, item: getattr(this, item, None),
                "set": lambda this, item, value: setattr(this, item, value)
            }
        )

        query = request_query()
        filter = {"project_id": self.case.project.id}

        if not user: user = self.case.user
        if not user.is_superuser: filter["author_id"] = user.id

        if card:
            query.set("card[]", card)
            filter["status__in"] = card
        if type_:
            query.set("type[]", type_)
            filter["file_type__in"] = type_
        if status:
            query.set("status", status)
            filter["status"] = status
        if downloaded:
            query.set("downloaded", downloaded)
            filter["is_downloaded"] = False
        if author:
            query.set("author[]", author)
            filter["author__in"] = author
        if from_:
            query.set("from", from_)
            filter["upload_date__gte"] = tz.make_aware(
                dt.strptime(from_, self.date_format)
            )
        if to:
            query.set("to", to)
            filter["upload_date__lte"] = tz.make_aware(
                dt.strptime(to, self.date_format)
            )

        return query, filter

    def _get_mixin(self, expected, is_admin=False, query={}, attrs=[]):
        query, _ = self._get_query(**query)

        if attrs: query.set("attr[]", attrs)

        user = self.admin if is_admin else self.case.user

        res, code = self._get_files(self.case.project.id, user, query)
        self.assertEqual(code, 200)
        self.assertEqual(len(res), expected)


class AnnotationTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.empty_project = Project.objects.create(name="asd")
        cls.request = lambda _, pid, fset: {"project_id": pid, "file_ids": fset}

    def test_annotate_files(self):
        res_no_proj, code_no_proj = _annotate_files(self.request(9999, []))
        res_empty, code_empty = _annotate_files(
            self.request(self.empty_project.id, [1, 2])
        )
        res, code = _annotate_files(
            self.request(self.case.project.id, [self.case.file_.id])
        )

        self.assertTrue(code == code_empty == code_no_proj == 202)
        self.assertTrue(res_no_proj["annotated"] == res_empty["annotated"] == 0)
        self.assertTrue(res_no_proj["annotation"] == res_empty["annotation"] == [])
        self.assertEqual(res["annotated"], 1)


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
            "fileID": str(uuid4())[:24],
            "name": "blog3",
            "extension": "png",
            "type": "image",
            "atrsGroups": [[cls.case.attribute.id]]
        }
        cls.post = type(
            'POST',
            (object,),
            {'get': lambda *x: dumps(cls.file_data)}
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
        self._form_instances_mixin({**meta, "atrsGroups": [1, 2]})

    def test_set_created(self):
        self.assertTrue(
            self.uploader.created_files
            == self.uploader.new_instances
            == []
        )

        self.uploader.new_instances = [(1, 2, 3)] * 3
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
        temp = self.uploader.meta
        self.assertEqual(self.uploader.new_instances, [])
        self._gather_instances_mixin([])
        self._gather_instances_mixin(temp)

    def test_get_groups(self):
        init_ag_count = AttributeGroup.objects.count()
        self.assertEqual(self.uploader.free_attributegroups, [])
        temp = self.uploader.meta

        self._get_groups_mixin([])
        self._get_groups_mixin(temp)

        self.assertEqual(
            init_ag_count + sum([len(m["atrsGroups"]) for m in temp]),
            AttributeGroup.objects.count()
        )

    def test_proceed_upload(self):
        temp = self.uploader.meta
        self.uploader.meta = None
        self.assertFalse(self.uploader.proceed_upload())

        self.uploader.meta = temp

        expected_count = sum([
            len(meta["atrsGroups"])
            for meta in self.uploader.meta
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
        self.uploader.meta = meta
        self.uploader.get_free_attributegroups()
        self.assertEqual(len(self.uploader.free_attributegroups), len(meta))

    def _gather_instances_mixin(self, meta):
        self.uploader.meta = meta
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
        self.assertEqual(self.uploader.meta, self.file_data)

        self.assertEqual(self.uploader.free_attributegroups, list())
        self.assertEqual(self.uploader.new_instances, list())
        self.assertEqual(self.uploader.created_files, list())
        self.assertEqual(self.uploader.groups_taken, 0)

        self.base_check = True
