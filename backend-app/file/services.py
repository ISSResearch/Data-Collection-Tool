from rest_framework.status import (
    HTTP_406_NOT_ACCEPTABLE,
    HTTP_400_BAD_REQUEST,
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_202_ACCEPTED
)
from rest_framework.request import QueryDict
from rest_framework.views import Request
from django.db import connection, transaction
from django.db.models import Count, Subquery, QuerySet
from django.utils import timezone as tz
from django.core.paginator import Paginator
from attribute.models import Level, AttributeGroup
from user.models import CustomUser
from json import loads
from typing import Any
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
            sub_query = AttributeGroup.objects \
                .filter(attribute__in=attribute_query) \
                .annotate(count=Count("uid")) \
                .filter(count=len(attribute_query)) \
                .values("uid")
            files = files.filter(attributegroup__in=Subquery(sub_query))
        else: files = files.distinct()

        page: int = int(request_query.get("page", 1))
        per_page: str | int = request_query.get("per_page")
        per_page = files.count() if per_page == "max" else int(per_page or 25)

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
        uploader.proceed_upload()

        response = {"result": uploader.success}

        return response, (
            HTTP_201_CREATED if uploader.success
            else HTTP_406_NOT_ACCEPTABLE
        )


class FileUploader:
    ASSIGN_QUERY: str = """
        insert into attribute_group_attribute
        (attributegroup_id, attribute_id)
        values (%s, %s)
        on conflict do nothing;
    """

    def __init__(self, request: Request, project_id: int) -> None:
        self.project_id: int = project_id
        self.author_id: int = request.user.id
        self.meta: dict[str, Any] = loads(request.POST.get('meta', ""))

    def proceed_upload(self) -> None:
        try:
            with transaction.atomic():
                meta_groups: list[dict[str, Any]] = self.meta.get('atrsGroups', [])

                file: File = File.objects.create(
                    id=self.meta["fileID"],
                    file_name=f'{self.meta["name"]}.{self.meta["extension"]}',
                    file_type=self.meta.get("type", 'file'),
                    project_id=self.project_id,
                    author_id=self.author_id,
                )

                file_groups: list[AttributeGroup] = [
                    AttributeGroup.objects.create(file=file)
                    for _ in range(len(meta_groups))
                ]

                self.assign_attributes(file_groups, meta_groups)

                self.success = True

        except Exception: self.success = False

    def assign_attributes(self, file_groups, meta_groups) -> None:
        assert len(file_groups) == len(meta_groups)

        if query_values := [
            (group.uid, attribute_id)
            for group, attributes in zip(file_groups, meta_groups)
            for attribute_id in attributes
        ]:
            with connection.cursor() as cur:
                cur.executemany(self.ASSIGN_QUERY, query_values)


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
