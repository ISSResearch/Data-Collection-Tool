from django.test import TestCase
from attribute.attribute_tests.mock_attribute import MockCase
from file.services import (
    FileUploader,
    StatsServices,
    ViewSetServices,
    form_export_file
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
        self._get_mixin(1, True, query={"page": 1, "per_page": 1}, per_page=1)
        self._get_mixin(2, True, query={"page": 1, "per_page": 2}, per_page=2)
        self._get_mixin(3, True, query={"page": 1, "per_page": "max"}, per_page="max")

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

        no_file_rq = self._patch_file("asdasd901823", request(request_data))
        self.assertEqual(no_file_rq[1], 404)
        self.assertEqual(no_file_rq[0]["errors"], "no such file")

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

    def test_form_orders(self):
        res1 = self._form_orders({"dateSort": "asc"})
        self.assertEqual(res1, ["-status", "upload_date"])

        res2 = self._form_orders({"dateSort": "desc"})
        self.assertEqual(res2, ["-status", "-upload_date"])

        res3 = self._form_orders({})
        self.assertEqual(res3, ["-status", "-upload_date"])

        res4 = self._form_orders({"fake": "value"})
        self.assertEqual(res4, ["-status", "-upload_date"])

    def test_form_filters(self):
        query = {}
        self._form_filters_mixin(query)

        query["card"] = [self.case.file_.status]
        self._form_filters_mixin(query)

        query["type_"] = ["image"]
        self._form_filters_mixin(query)

        query["status"] = "v"
        self._form_filters_mixin(query)

        query["downloaded"] = True
        self._form_filters_mixin(query)

        query["author"] = self.admin
        self._form_filters_mixin(query)

        query["from_"] = dt.now().strftime(self.date_format)
        self._form_filters_mixin(query)

        query["to"] = (dt.now() + td(days=1)).strftime(self.date_format)
        self._form_filters_mixin(query)

    def _form_filters_mixin(self, data={}):
        query, filter = self._get_query(**data)
        res = self._form_filters(
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
        to="",
        page=None,
        per_page=None
    ):
        request_query = type(
            "query",
            (object,),
            {
                "get": lambda this, item, default=None: getattr(this, item, default),
                "getlist": lambda this, item, default=None: getattr(this, item, default),
                "set": lambda this, item, value: setattr(this, item, value)
            }
        )

        query = request_query()
        filter = {"project_id": self.case.project.id}

        if not user: user = self.case.user
        if not user.is_superuser: filter["author_id"] = user.id

        if page: query.set("page", page)
        if per_page: query.set("per_page", per_page)
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

    def _get_mixin(self, expected, is_admin=False, query={}, attrs=[], per_page=25):
        query, _ = self._get_query(**query)

        if attrs: query.set("attr[]", attrs)

        user = self.admin if is_admin else self.case.user

        res, code = self._get_files(self.case.project.id, user, query)
        self.assertEqual(code, 200)

        self.assertEqual(len(res["data"]), expected)
        self.assertEqual(
            res["per_page"],
            (
                len(res["data"])
                if per_page == "max"
                else per_page
            )
        )


class StatsServiceTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.empty_project = Project.objects.create(name="some")

    def test_from_attribute(self):
        empty_res, empty_code = StatsServices.from_attribute(self.empty_project.id)
        no_proj_res, no_proj_code = StatsServices.from_attribute(9999)
        res, code = StatsServices.from_attribute(self.case.project.id)

        check_against = {
            "id": self.case.attribute.id,
            "levelName": self.case.level.name,
            "order": self.case.level.order,
            "name": self.case.attribute.name,
            "parent": self.case.attribute.parent,
            "payload": None,
            self.case.file_.status or "v": {
                self.case.file_.file_type or "no data":
                    self.case.file_.attributegroup_set.first().attribute.count()
            },
        }

        self.assertTrue(empty_code == code == no_proj_code == 200)
        self.assertTrue(empty_res == no_proj_res == [])

        self.assertEqual(len(res), self.case.project.file_set.count())
        self.assertEqual(res[0], check_against)

    def test_from_user(self):
        empty_res, empty_code = StatsServices.from_user(self.empty_project.id)
        no_proj_res, no_proj_code = StatsServices.from_user(9999)
        res, code = StatsServices.from_user(self.case.project.id)

        empty_res = list(empty_res)
        no_proj_res = list(no_proj_res)
        res = list(res)

        check_against = {
            "id": self.case.user.id,
            "name": self.case.user.username,
            self.case.file_.status or "v": {
                self.case.file_.file_type or "no data":
                    self.case.project.file_set.count()
            },
        }

        self.assertTrue(empty_code == code == no_proj_code == 200)
        self.assertTrue(empty_res == no_proj_res == [])

        self.assertEqual(len(res), self.case.project.file_set.count())
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

    def test_proceed_upload(self):
        uploader = FileUploader(self.request, self.case.project.id)
        init_count = File.objects.count()

        temp = uploader.meta
        uploader.meta = None
        uploader.proceed_upload()

        self.assertFalse(uploader.success)

        uploader.meta = temp

        expected_group_count = len(uploader.meta["atrsGroups"])

        uploader.proceed_upload()
        self.assertTrue(uploader.success)

        self.assertEqual(init_count + 1, File.objects.count())
        self.assertEqual(
            File.objects.get(id=self.file_data["fileID"]).attributegroup_set.count(),
            expected_group_count
        )

    def test_assign_attributes(self):
        uploader = FileUploader(self.request, self.case.project.id)

        meta_groups = uploader.meta["atrsGroups"]
        try:
            uploader.assign_attributes([], meta_groups)
            self.assertTrue(False)
        except Exception: self.assertTrue(True)

        groups = [AttributeGroup.objects.create() for _ in range(len(meta_groups))]

        uploader.assign_attributes(groups, meta_groups)

        self.assertEqual(
            groups[0].attribute.count(),
            len(meta_groups[0])
        )
        self.assertEqual(
            set(groups[0].attribute.values_list("id", flat=True)),
            set(meta_groups[0])
        )


class ExportServicesTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()

    def test_export(self):
        self._assert_query_fail({})
        self._assert_query_fail({"type": 1})
        self._assert_query_fail({"type": 1, "project_id": 1})
        self._assert_query_fail({"type": "json", "project_id": 1, "choice": "user"}, True)

        try:
            form_export_file({"type": "asd", "project_id": 1, "choice": "zxc"})
            self.assertTrue(False)
        except Exception as e: self.assertEqual(str(e), "asd not implemented")

        try:
            form_export_file({"type": "json", "project_id": 1, "choice": "zxc"})
            self.assertTrue(False)
        except Exception as e: self.assertEqual(str(e), "export for zxc is not implemented")

    def _assert_query_fail(self, data, intential=False):
        queries = {"type", "project_id", "choice"}

        string = " must be provided"
        try:
            form_export_file(data)
            self.assertTrue(intential, "not suppose to go there")
        except Exception as e:
            self.assertEqual(
                set(str(e)[:-len(string)].split(", ")),
                queries - set(data)
            )
