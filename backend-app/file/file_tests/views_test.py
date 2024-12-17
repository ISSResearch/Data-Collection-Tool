from django.test import TestCase
from attribute.attribute_tests.mock_attribute import MockCase
from file.models import File
from user.models import CustomUser
from attribute.models import Attribute
from json import dumps
from uuid import uuid4


class FileViewSetTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.admin = CustomUser.objects.create(
            username="admin",
            password="passowrd",
            is_superuser=True
        )

    def test_patch_file(self):
        init_state = self.case.file_.attributegroup_set \
            .first() \
            .attribute \
            .first().id
        new_attr = Attribute.objects.create(
            name='new_atr',
            project=self.case.project,
            level=self.case.level
        )

        request_data = {
            'status': 'a',
            'attribute': {str(self.case.attributegroup.uid): [new_attr.id]}
        }

        invalid_request = self.client.patch(
            f'/api/files/{self.case.file_.id}/',
            data=request_data,
            content_type="application/json",
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )

        self.case.project.user_validate.add(self.case.user.id)

        request = self.client.patch(
            f'/api/files/{self.case.file_.id}/',
            data=request_data,
            content_type='application/json',
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )
        new_state = self.case.file_.attributegroup_set \
            .first() \
            .attribute \
            .first().id
        self.assertEqual(invalid_request.status_code, 403)
        self.assertEqual(request.status_code, 202)
        self.assertTrue(request.data['ok'])
        self.assertNotEqual(new_state, init_state)
        self.assertEqual(File.objects.get(id=self.case.file_.id).status, "a")

        request_data["status"] = "d"
        admin_request = self.client.patch(
            f'/api/files/{self.case.file_.id}/',
            data=request_data,
            content_type='application/json',
            HTTP_AUTHORIZATION="Bearer " + self.admin.emit_token()
        )
        self.assertEqual(admin_request.status_code, 202)
        self.assertTrue(admin_request.data['ok'])
        self.assertEqual(File.objects.get(id=self.case.file_.id).status, "d")
        self.assertEqual(
            self.case.file_.attributegroup_set
                .first()
                .attribute
                .first().id,
            new_state
        )

    def test_delete_file(self):
        self.case.project.file_set.create(
            id="zxcqwe",
            file_name="asd",
            author_id=self.admin.id
        )
        init_count = self.case.project.file_set.count()

        invalid_request = self.client.delete(
            f'/api/files/{self.case.file_.id}/',
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )

        self.case.project.user_upload.add(self.case.user.id)

        request = self.client.delete(
            f'/api/files/{self.case.file_.id}/',
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )

        self.assertEqual(init_count - 1, self.case.project.file_set.count())

        admin_request = self.client.delete(
            f'/api/files/{self.case.project.file_set.last().id}/',
            HTTP_AUTHORIZATION="Bearer " + self.admin.emit_token()
        )

        self.assertEqual(invalid_request.status_code, 403)
        self.assertTrue(request.status_code == admin_request.status_code == 202)

        self.assertEqual(init_count - 2, self.case.project.file_set.count())


class FilesViewSetTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.admin = CustomUser.objects.create(
            username="admin",
            password="password",
            is_superuser=True
        )

    def test_get_files(self):
        self.case.project.file_set.create(
            file_name='f_name2',
            author_id=self.case.user.id
        )

        invalid_request = self.client.get(
            f'/api/files/project/{self.case.project.id}/',
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )

        self.case.project.user_view.add(self.case.user.id)

        request = self.client.get(
            f'/api/files/project/{self.case.project.id}/',
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )

        admin_request = self.client.get(
            f'/api/files/project/{self.case.project.id}/',
            HTTP_AUTHORIZATION="Bearer " + self.admin.emit_token()
        )

        self.assertEqual(invalid_request.status_code, 403)
        self.assertTrue(admin_request.status_code == request.status_code == 200)
        self.assertTrue(
            len(request.data["data"])
            == len(admin_request.data["data"])
            == self.case.project.file_set.count()
        )

    def test_post_files(self):
        init_count = self.case.project.file_set.count()
        request = lambda: {
            "fileID": str(uuid4())[:24],
            "name": "blog3 copy",
            "extension": "png",
            "type": "image",
            "atrsGroups": [[]]
        }

        invalid_response = self.client.post(
            f'/api/files/project/{self.case.project.id}/',
            data={'meta': dumps(request())},
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )

        self.case.project.user_upload.add(self.case.user.id)

        response = self.client.post(
            f'/api/files/project/{self.case.project.id}/',
            data={'meta': dumps(request())},
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )

        self.assertEqual(init_count + 1, self.case.project.file_set.count())
        admin_response = self.client.post(
            f'/api/files/project/{self.case.project.id}/',
            data={'meta': dumps(request())},
            HTTP_AUTHORIZATION="Bearer " + self.admin.emit_token()
        )

        self.assertEqual(invalid_response.status_code, 403)
        self.assertTrue(admin_response.status_code == response.status_code == 201)
        self.assertTrue(all([admin_response.data["result"], response.data['result']]))
        self.assertEqual(init_count + 2, self.case.project.file_set.count())


class StatsViewTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.admin = CustomUser.objects.create(
            username="admin",
            password="password",
            is_superuser=True
        )

    def test_attribute_stats(self):
        invalid_request = self.client.get(
            f"/api/files/stats/attribute/{self.case.project.id}/",
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )

        self.case.project.user_stats.add(self.case.user.id)

        request = self.client.get(
            f"/api/files/stats/attribute/{self.case.project.id}/",
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )
        admin_request = self.client.get(
            f"/api/files/stats/attribute/{self.case.project.id}/",
            HTTP_AUTHORIZATION="Bearer " + self.admin.emit_token()
        )

        self.assertEqual(invalid_request.status_code, 403)
        self.assertTrue(request.status_code == admin_request.status_code == 200)
        self.assertIsNotNone(request.data)
        self.assertIsNotNone(admin_request.data)

    def test_from_user(self):
        invalid_request = self.client.get(
            f"/api/files/stats/user/{self.case.project.id}/",
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )

        self.case.project.user_stats.add(self.case.user.id)

        request = self.client.get(
            f"/api/files/stats/user/{self.case.project.id}/",
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )
        admin_request = self.client.get(
            f"/api/files/stats/user/{self.case.project.id}/",
            HTTP_AUTHORIZATION="Bearer " + self.admin.emit_token()
        )

        self.assertEqual(invalid_request.status_code, 403)
        self.assertTrue(request.status_code == admin_request.status_code == 200)
        self.assertIsNotNone(request.data)
        self.assertIsNotNone(admin_request.data)


class AnnotationViewTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.case = MockCase()
        cls.admin = CustomUser.objects.create(
            username="admin",
            password="password",
            is_superuser=True
        )

    def test_annotate_files(self):
        invalid_request = self.client.post(
            "/api/files/annotation/",
            data={
                "project_id": self.case.project.id,
                "file_ids": []
            },
            content_type="application/json",
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )

        self.case.project.user_stats.add(self.case.user.id)

        request = self.client.post(
            "/api/files/annotation/",
            data={
                "project_id": self.case.project.id,
                "file_ids": []
            },
            content_type="application/json",
            HTTP_AUTHORIZATION="Bearer " + self.case.user.emit_token()
        )


        admin_request = self.client.post(
            "/api/files/annotation/",
            data={
                "project_id": self.case.project.id,
                "file_ids": [self.case.file_.id]
            },
            content_type="application/json",
            HTTP_AUTHORIZATION="Bearer " + self.admin.emit_token()
        )

        internal_request = self.client.post(
            "/api/files/annotation/",
            data={
                "project_id": self.case.project.id,
                "file_ids": [self.case.file_.id]
            },
            content_type="application/json",
            HTTP_AUTHORIZATION="Internal " + self.admin.emit_token()
        )

        self.assertTrue(
            invalid_request.status_code
            == request.status_code
            == admin_request.status_code
            == 403
        )
        self.assertEqual(internal_request.status_code, 202)
        self.assertEqual(internal_request.data["annotated"], 1)
