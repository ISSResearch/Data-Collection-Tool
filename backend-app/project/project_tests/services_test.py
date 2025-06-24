from django.test import TestCase
from project.services import Project, ViewSetServices
from .mock_project import MOCK_PROJECT
from user.models import CustomUser


class ProjectViewSetTest(TestCase, MOCK_PROJECT, ViewSetServices):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.projects = Project.objects.bulk_create([
            Project(name=cls.data['name'] + str(i))
            for i in range(2)
        ])
        cls.users = CustomUser.objects.bulk_create([
            CustomUser(
                username=f"name_{i}",
                password="pass",
                is_superuser=not bool(i)
            )
            for i in range(3)
        ])

        for form in cls.data['attributes']: cls.projects[0].add_attributes(form)
        cls.projects[0].user_visible.add(cls.users[1].id)
        cls.projects[0].user_upload.add(cls.users[1].id)

    def test_get_projects(self):
        for available_for, user in zip((2, 1, 0), self.users):
            result = self._get_available_projects(user).data
            self.assertEqual(len(result), available_for)

    def test_invalid_create_project(self):
        init_count = Project.objects.count()
        result, status = self._create_project({"name": ""})

        self.assertFalse(result["ok"])
        self.assertIsNotNone(result.get("errors"))
        self.assertEqual(status, 400)
        self.assertEqual(init_count, Project.objects.count())

    def test_create_project(self):
        init_count = Project.objects.count()
        result, status = self._create_project({
            "name": "name",
            "description": "description"
        })

        self.assertTrue(result["ok"])
        self.assertIsNone(result.get("errors"))
        self.assertEqual(status, 201)
        self.assertEqual(init_count + 1, Project.objects.count())

    def test_get_unexisted_project(self):
        result, code = self._get_project(
            Project.objects.count() + 1,
            type("request", (object,), {"user": self.users[0]})
        )

        self.assertEqual(code, 404)
        self.assertEqual(result["message"], "query project does not exist")

    def test_get_project(self):
        result_1, code_1 = self._get_project(
            self.projects[0].id,
            type("request", (object,), {"user": self.users[2]})
        )
        result_2, code_2 = self._get_project(
            self.projects[0].id,
            type("request", (object,), {"user": self.users[1]})
        )

        self.assertEqual(code_1, 200)
        self.assertIsNone(result_1.get("message"))
        self.assertEqual(result_1["name"], self.projects[0].name)
        self.assertFalse(any([
            permission
            for permission
            in result_1["permissions"].values()
        ]))

        self.assertEqual(code_2, 200)
        self.assertIsNone(result_2.get("message"))
        self.assertEqual(result_2["name"], self.projects[0].name)
        self.assertTrue(any([
            permission
            for permission
            in result_2["permissions"].values()
        ]))

    def test_invalid_patch_project(self):
        result, code = self._patch_project(
            self.projects[0].id,
            {"name": ""}
        )

        self.assertEqual(code, 400)
        self.assertIsNotNone(result.get("errors"))

    def test_patch_project(self):
        prev = self.projects[0]

        new_data = {
            "name": "other_name",
            "description": "other_description",
            "attributes": self.data["attributes"]
        }

        new_data["attributes"][1]['levels'][0]['name'] = 'patch_name'
        new_data["attributes"][1]['levels'][0]['required'] = True
        new_data["attributes"][1]['levels'].append({
            'id': 7327785592261161,
            'multiple': True,
            'name': "new_patch_level",
            'order': 1,
            'required': False
        })

        new_data["attributes"][1]['attributes'][2]['name'] = 'patch_name'
        new_data["attributes"][1]['attributes'][2]['order'] = 1

        result, code = self._patch_project(self.projects[0].id, new_data)
        patched_level = self.projects[0] \
            .level_set.get(uid=new_data["attributes"][1]["levels"][0]["id"])
        patched_attribute = self.projects[0].attribute_set.last()

        self.assertEqual(code, 202)
        self.assertTrue(result.get("ok"))
        self.assertNotEqual(prev.name, Project.objects.get(id=prev.id).name)
        self.assertNotEqual(
            prev.description,
            Project.objects.get(id=prev.id).description
        )
        self.assertEqual(Project.objects.get(id=prev.id).name, "other_name")
        self.assertEqual(
            Project.objects.get(id=prev.id).description,
            "other_description"
        )
        self.assertEqual(patched_level.name, "patch_name")
        self.assertTrue(patched_level.required)
        self.assertEqual(patched_attribute.name, "patch_name")
        self.assertEqual(patched_attribute.order, 1)
        self.assertEqual(self.projects[0].level_set.last().name, "new_patch_level")

    def test_invalid_delete(self):
        initial_count = len(self.projects)

        result_1, code_1 = self._delete_project(Project.objects.last().id + 1, {})
        result_2, code_2 = self._delete_project(
            self.projects[-1].id,
            {"approval": "some_wrong_name"}
        )

        self.assertEqual(code_1, 404)
        self.assertEqual(code_2, 400)
        self.assertIsNotNone(result_1.get("message"))
        self.assertIsNotNone(result_2.get("message"))
        self.assertEqual(initial_count, Project.objects.count())

    def test_delete(self):
        initial_count = Project.objects.filter(visible=True).count()

        result, code = self._delete_project(
            self.projects[-1].id,
            {"approval": self.projects[-1].name}
        )

        self.assertTrue(code, 200)
        self.assertTrue(result["deleted"])
        self.assertEqual(
            initial_count - 1,
            Project.objects.filter(visible=True).count()
        )
