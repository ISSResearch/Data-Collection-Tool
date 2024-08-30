from rest_framework.serializers import ModelSerializer, SerializerMethodField, IntegerField
from rest_framework.views import Request
from typing import Any
from attribute.serializers import LevelSerializer
from .models import Project, ProjectGoal


class ProjectsSerializer(ModelSerializer):
    class Meta:
        model = Project
        fields = ("id", "name", "description", "created_at")

    def add_attributes(self) -> None:
        attributeForm: list[list[dict[str, Any]]] = self.initial_data.get("attributes", ())
        for form in attributeForm: self.instance.add_attributes(form)


class ProjectSerializer(ProjectsSerializer):
    attributes = SerializerMethodField()
    permissions = SerializerMethodField()

    class Meta(ProjectsSerializer.Meta):
        fields = ("id", "name", "description", "attributes", "permissions")

    def get_attributes(self, instance: Project) -> dict[str, Any]:
        levels: LevelSerializer = LevelSerializer(
            instance.level_set.order_by("order", "id").all(),
            many=True
        )
        return levels.data

    def get_permissions(self, instance: Project) -> dict[str, bool]:
        request: Request = self.context.get("request")
        if not request: return {}

        user_id: int = request.user.id

        return {
            "upload": user_id in {user.id for user in instance.user_upload.all()},
            "view": user_id in {user.id for user in instance.user_view.all()},
            "goals": user_id in {user.id for user in instance.user_upload.all()},
            "validate": user_id in {user.id for user in instance.user_validate.all()},
            "stats": user_id in {user.id for user in instance.user_stats.all()},
            "download": user_id in {user.id for user in instance.user_download.all()},
            "edit": user_id in {user.id for user in instance.user_edit.all()},
        }


class GoalSerializer(ModelSerializer):
    project = SerializerMethodField()
    complete = IntegerField(read_only=True)

    class Meta:
        model = ProjectGoal
        exclude = ("attribute", )

    def get_project(self, instance: ProjectGoal) -> int: return instance.project.id
