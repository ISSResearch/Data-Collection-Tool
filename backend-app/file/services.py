from rest_framework.status import (
    HTTP_406_NOT_ACCEPTABLE,
    HTTP_400_BAD_REQUEST,
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_202_ACCEPTED
)
from rest_framework.request import QueryDict
from rest_framework.views import Request
from django.db import connection
from django.db.models import Count, Subquery, QuerySet
from django.utils import timezone as tz
from django.core.paginator import Paginator
from attribute.models import Level, AttributeGroup as AGroup
from user.models import CustomUser
from json import loads
from typing import Any
from uuid import UUID
from datetime import datetime as dt
from .serializers import File, FileSerializer


class ViewSetServices:
    FILES_PREFETCH_FIELDS = (
        "attributegroup_set",
        "attributegroup_set__attribute",
        "attributegroup_set__attribute__level"
    )
    FILES_QUERIES = (
        ("status__in", "card[]", True),
        ("file_type__in", "type[]", True),
        ("status", "status", False),
        ("is_downloaded", "downloaded", False),
        ("author__in", "author[]", True),
        ("upload_date__gte", "from", False),
        ("upload_date__lte", "to", False)
    )

    def _patch_file(
        self,
        file_id: str,
        request: Request
    ) -> tuple[dict[str, Any], int]:
        # TODO: no handler for nofile case. imp tests after
        file = File.objects \
            .select_related("author") \
            .prefetch_related("attributegroup_set") \
            .get(id=file_id)

        updated_file = FileSerializer(
            file,
            request.data,
            partial=True,
            context={"validator": request.user}
        )
        update_valid = updated_file.is_valid()

        if update_valid: updated_file.update_file()

        response = {"ok": update_valid}

        if not update_valid: response["errors"] = updated_file.errors

        return (
            response,
            HTTP_202_ACCEPTED if update_valid else HTTP_400_BAD_REQUEST
        )

    def _delete_file(self, file_id: str) -> tuple[dict[str, Any], int]:
        try:
            file = File.objects.get(id=file_id)
            file.attributegroup_set.all().delete()
            file.delete()

            return {"deleted": True}, HTTP_202_ACCEPTED

        except Exception: return {"deleted": False}, HTTP_400_BAD_REQUEST

    def _form_query(
        self,
        project_id: int,
        request_user: CustomUser,
        request_query: QueryDict[str, Any]
    ) -> dict[str, Any]:
        only_self_files: bool = not any([
            request_user.is_superuser,
            bool(request_user.project_validate.filter(id=project_id)),
        ])

        query = {"project_id": project_id}

        if only_self_files: query["author_id"] = request_user.id

        for filter_name, param, is_list in self.FILES_QUERIES:
            query_param = (
                request_query.getlist(param) if is_list
                else request_query.get(param)
            )

            if query_param:
                query[filter_name] = self._get_param(filter_name, query_param)

        return query

    def _get_param(self, filter_name: str, query_param: Any) -> Any:
        date_from_str = lambda d: tz.make_aware(dt.strptime(d, "%Y-%m-%d"))
        match filter_name:
            case "is_downloaded": return False
            case "upload_date__gte": return date_from_str(query_param)
            case "upload_date__lte": return date_from_str(query_param)
            case _: return query_param

    def _get_files(
        self,
        project_id: int,
        request_user: CustomUser,
        request_query: QueryDict[str, Any]
    ) -> tuple[dict[str, list[dict[str, Any]] | int], int]:
        filter_query = self._form_query(project_id, request_user, request_query)

        files = File.objects \
            .select_related("author") \
            .prefetch_related(*self.FILES_PREFETCH_FIELDS) \
            .order_by("-status", "-upload_date") \
            .filter(**filter_query)

        attribute_query = request_query.getlist("attr[]")

        if attribute_query:
            sub_query = AGroup.objects \
                .filter(attribute__in=attribute_query) \
                .annotate(count=Count("uid")) \
                .filter(count=len(attribute_query)) \
                .values("uid")
            files = files.filter(attributegroup__in=Subquery(sub_query))
        else: files = files.distinct()

        page: int = int(request_query.get("page", 1))
        per_page: int = int(request_query.get("per_page", 25))
        paginator: Paginator = Paginator(files, per_page)

        return {
            "data": FileSerializer(
                paginator.page(page).object_list,
                many=True
            ).data,
            "page": page,
            "per_page": paginator.per_page,
            "total_pages": paginator.num_pages
        }, HTTP_200_OK

    def _create_file(
        self,
        project_id: int,
        request: Request
    ) -> tuple[dict[str, Any], int]:
        uploader = FileUploader(request, project_id)
        succeed = uploader.proceed_upload()

        response = {"result": succeed}

        return response, (
            HTTP_201_CREATED if succeed
            else HTTP_406_NOT_ACCEPTABLE
        )


class FileUploader:
    ASSIGN_GROUP_QUERY: str = """
        insert into attribute_group_attribute
        (attributegroup_id, attribute_id)
        values (%s, %s)
        on conflict do nothing;
    """

    def __init__(self, request: Request, project_id: int) -> None:
        self.project_id: int = project_id
        self.author_id: int = request.user.id
        self.meta: dict[str, Any] = loads(request.POST.get('meta', ""))

        self.free_attributegroups: list[AGroup] = list()
        self.groups_taken: int = 0

    def proceed_upload(self) -> bool:
        try:
            self.get_free_attributegroups()
            self.get_instance()
            self.write_instances()
            self.assign_attributes()

            return True

        except Exception: return False

    def get_free_attributegroups(self) -> None:
        required_length: int = len(self.meta.get('atrsGroups', []))

        available_groups: list[AGroup] = list(AGroup.get_free_groups())

        new_groups: list[AGroup] = AGroup.objects.bulk_create(
            [AGroup() for _ in range(required_length - len(available_groups))],
            batch_size=400
        )

        available_groups.extend(new_groups)

        self.free_attributegroups = available_groups[:required_length]

    def get_instance(self) -> None:
        self.instance: tuple[File, list, list] = self._form_instance(self.meta)

    def write_instances(self) -> None:
        file, file_groups, _ = self.instance

        file.save()
        AGroup.objects.bulk_update(
            [group for group in file_groups],
            ['file_id'],
            batch_size=300
        )

    def assign_attributes(self) -> None:
        _, file_groups, file_meta = self.instance

        prepared_query: list[tuple[AGroup, list]] = [
            (file_groups[i], file_meta[i])
            for i in range(len(file_groups))
        ]

        query_values: list[tuple[UUID, int]] = [
            (group_id.uid, attribute_id)
            for group_id, attributes in prepared_query
            for attribute_id in attributes
        ]

        if query_values:
            with connection.cursor() as cur: cur.executemany(
                self.ASSIGN_GROUP_QUERY,
                query_values
            )

    def _form_instance(self, meta: dict[str, Any]) -> tuple[File, list[AGroup], list]:
        file_groups_count: int = len(meta.get('atrsGroups', []))

        file: File = File(
            id=meta["fileID"],
            file_name=f'{meta["name"]}.{meta["extension"]}',
            file_type=meta.get("type", 'file'),
            project_id=self.project_id,
            author_id=self.author_id,
        )

        file_groups: list[AGroup] = self._assign_groups(file, file_groups_count)

        return file, file_groups, meta.get('atrsGroups', [])

    def _assign_groups(self, file: File, groups_count: int) -> list[AGroup]:
        file_groups: list[AGroup] = list()
        end: int = self.groups_taken + groups_count

        for group in self.free_attributegroups[self.groups_taken:end]:
            group.file = file
            file_groups.append(group)

        self.groups_taken += groups_count

        return file_groups


class StatsServices:
    _ATTRIUBE_QUERY_VALUES: tuple[str, ...] = (
        "order",
        "name",
        "attribute__id",
        "attribute__name",
        "attribute__parent",
        "attribute__attributegroup__file__file_type",
        "attribute__attributegroup__file__status"
    )

    _USER_QUERY_VALUES: tuple[str, ...] = (
        "author_id",
        "author__username",
        "status",
        "file_type"
    )

    @classmethod
    def from_attribute(cls, project_id: int) -> tuple[list[dict[str, Any]], int]:
        stats: list[dict[str, Any]] = list(
            Level.objects
            .filter(project_id=project_id)
            .order_by("order", "id")
            .values(*cls._ATTRIUBE_QUERY_VALUES)
            .annotate(count=Count("attribute__attributegroup__file__file_type"))
        )

        empty_attributes_files: list[dict[str, Any]] = list(
            File.objects
            .filter(project_id=project_id, attributegroup__isnull=False)
            .values("file_type", "status")
            .annotate(
                file_count=Count("file_type"),
                attribute_count=Count("attributegroup__attribute")
            )
            .filter(attribute_count=0)
        )

        no_attributegroup_files: list[dict[str, Any]] = list(
            File.objects
            .filter(project_id=project_id, attributegroup__isnull=True)
            .annotate(
                file_count=Count("file_type"),
                attribute_count=Count("attributegroup")
            )
            .values("file_type", "status", "file_count")
            .filter(attribute_count=0)
        )

        empty_stats: list[dict[str, Any]] = [
            {
                "name": "no level",
                "attribute__name": "No attribute",
                "attribute__parent": None,
                "attribute__id": "no-id",
                "attribute__attributegroup__file__file_type": entry["file_type"],
                "attribute__attributegroup__file__status": entry["status"],
                "count": entry["file_count"]
            }
            for entry in empty_attributes_files + no_attributegroup_files
        ]

        if empty_stats: stats.extend(empty_stats)

        return stats, HTTP_200_OK

    @classmethod
    def from_user(cls, project_id: int):
        stats: list[dict[str, Any]] = list(
            File.objects
                .filter(project_id=project_id)
                .order_by("author_id")
                .values(*cls._USER_QUERY_VALUES)
                .annotate(count=Count("file_type"))
        )

        return stats, HTTP_200_OK


def _annotate_files(request_data: dict[str, Any]) -> tuple[dict[str, Any], int]:
    annotation: QuerySet = File.objects \
        .select_related("author", "project") \
        .prefetch_related(
            "attributegroup_set",
            "attributegroup_set__attribute",
            "attributegroup_set__attribute__level"
        ) \
        .filter(
            project_id=request_data.get("project_id"),
            id__in=request_data.get("file_ids")
        )

    annotated: int = annotation.update(is_downloaded=True)

    return {
        "annotated": annotated,
        "annotation": FileSerializer(annotation, many=True).data
    }, HTTP_202_ACCEPTED
