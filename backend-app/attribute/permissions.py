from rest_framework.permissions import BasePermission
from .models import Level, Attribute


class LevelPermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser: return True

        method = request.method
        try:
            if method == 'GET':
                level_id = view.kwargs['levelID']
                project_id = Level.objects.get(uid=level_id).project_id

                return bool(request.user.project_edit.filter(id=project_id))

            if method == 'DELETE':
                level_ids = request.data.get('id_set', ())
                project_ids = set(
                    Level.objects.filter(uid__in=level_ids).values_list('project_id', flat=True)
                )

                user_edit_permissions = set(request.user.project_edit.values_list('id', flat=True))
                difference = user_edit_permissions - project_ids

                return user_edit_permissions and len(difference) == 0

        except Level.DoesNotExist: return True


class AttributePermission(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser: return True

        method = request.method
        try:
            if method == 'GET':
                attribute_id = view.kwargs['attributeID']
                project_id = Attribute.objects.get(id=attribute_id).project_id

                return bool(request.user.project_edit.filter(id=project_id))

            if method == 'DELETE':
                attribute_ids = request.data.get('id_set', ())
                project_ids = set(
                    Attribute.objects.filter(id__in=attribute_ids).values_list('project_id', flat=True)
                )
                user_edit_permissions = set(request.user.project_edit.values_list('id', flat=True))

                difference = user_edit_permissions - project_ids
                return user_edit_permissions and len(difference) == 0

        except Attribute.DoesNotExist: return True
