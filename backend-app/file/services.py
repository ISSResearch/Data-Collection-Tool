from rest_framework.status import (
    HTTP_406_NOT_ACCEPTABLE,
    HTTP_400_BAD_REQUEST,
    HTTP_201_CREATED,
    HTTP_200_OK,
    HTTP_202_ACCEPTED,
    HTTP_404_NOT_FOUND
)
from rest_framework.request import QueryDict
from rest_framework.views import Request
from django.db import connection, transaction
from django.db.models import Count, Subquery, QuerySet, Q
from django.utils import timezone as tz
from django.core.paginator import Paginator
from attribute.models import Level, AttributeGroup
from user.models import CustomUser
from json import loads
from typing import Any
from datetime import datetime as dt
from io import BytesIO
from .export import IMPLEMENTED, JSON, CSV, XLS
from .serializers import File, FileSerializer


class ViewSetServices:
    FILES_PREFETCH_FIELDS = (
        "file_set",
        "rebound__file_set",
        "attributegroup_set",
        "attributegroup_set__attribute",
        "attributegroup_set__attribute__level",
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
        try:
            file = File.objects \
                .select_related("author") \
                .prefetch_related("attributegroup_set") \
                .get(id=file_id)
        except File.DoesNotExist: return {"errors": "no such file"}, HTTP_404_NOT_FOUND

        updated_file = FileSerializer(
            file,
            request.data,
            partial=True,
            context={"validator": request.user}
        )

        if valid := updated_file.is_valid():
            try: updated_file.update_file()
            except Exception: valid = False

        response = {"ok": valid}

        if not valid: response["errors"] = updated_file.errors

        return response, HTTP_202_ACCEPTED if valid else HTTP_400_BAD_REQUEST

    def _delete_file(self, file_id: str) -> tuple[dict[str, Any], int]:
        try:
            with transaction.atomic():
                file = File.objects.get(id=file_id)
                file.attributegroup_set.all().delete()
                file.delete()

                return {"deleted": True}, HTTP_202_ACCEPTED

        except Exception: return {"deleted": False}, HTTP_400_BAD_REQUEST

    def _form_orders(self, query: QueryDict) -> list[str]:
        date_order = ("" if query.get("dateSort") == "asc" else "-") + "upload_date"
        return ["-status", date_order]

    def _form_filters(
        self,
        project_id: int,
        request_user: CustomUser,
        request_query: QueryDict
    ) -> dict[str, Any] | Q:
        if request_query.get("only_duplicates") == "t":
            return Q(file__isnull=False) | Q(rebound__isnull=False)

        only_self_files: bool = not any([
            request_user.is_superuser,
            bool(request_user.project_validate.filter(id=project_id)),
        ])

        query: dict[str, Any] = {"project_id": project_id}

        if only_self_files: query["author_id"] = request_user.id

        for filter_name, param, is_list in self.FILES_QUERIES:
            if query_param := (
                request_query.getlist(param)
                if is_list
                else request_query.get(param)
            ): query[filter_name] = self._get_param(filter_name, query_param)

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
        request_query: QueryDict
    ) -> tuple[dict[str, Any], int]:
        filters = self._form_filters(project_id, request_user, request_query)
        orders = self._form_orders(request_query)

        files = File.objects \
            .select_related("author") \
            .prefetch_related(*self.FILES_PREFETCH_FIELDS) \
            .select_related("rebound") \
            .order_by(*orders)

        if isinstance(filters, Q): files = files.filter(filters, project_id=project_id)
        else: files = files.filter(**filters)

        attribute_query = request_query.getlist("attr[]")

        if attribute_query:
            sub_query = AttributeGroup.objects \
                .filter(attribute__in=attribute_query) \
                .annotate(count=Count("uid")) \
                .filter(count=len(attribute_query)) \
                .values("uid")
            files = files.filter(attributegroup__in=Subquery(sub_query))
        else: files = files.distinct()

        page = int(request_query.get("page", 1))
        per_page = request_query.get("per_page")
        per_page = files.count() if per_page == "max" else int(per_page or 25)

        paginator: Paginator = Paginator(files, per_page)

        try: return {
            "data": FileSerializer(
                paginator.page(page).object_list,
                many=True
            ).data,
            "page": page,
            "per_page": paginator.per_page,
            "total_pages": paginator.num_pages
        }, HTTP_200_OK
        except Exception: return {}, HTTP_404_NOT_FOUND

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

    user_item = lambda row: (
        row["author_id"],
        row["author__username"],
        row.get("count") or 0,
        row.get("status") or "v",
        row.get("file_type") or "no data",
    )

    attribute_item = lambda row: (
        row["attribute__id"],
        row.get("attribute__attributegroup__file__status") or "v",
        row.get("attribute__name") or "no name",
        row.get("attribute__attributegroup__file__file_type") or "no data",
        row.get("attribute__parent"),
        row["name"],
        row.get("order") or 0,
        row.get("count") or 0,
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

        return cls._attribute_stat_adapt(stats), HTTP_200_OK

    @classmethod
    def from_user(cls, project_id: int):
        stats: list[dict[str, Any]] = list(
            File.objects
                .filter(project_id=project_id)
                .order_by("author_id")
                .values(*cls._USER_QUERY_VALUES)
                .annotate(count=Count("file_type"))
        )

        return cls._user_stat_adapt(stats), HTTP_200_OK

    @classmethod
    def _attribute_stat_adapt(cls, stat_data: list[dict[str, Any]]) -> list[dict[str, Any]]:
        prepared_stats = {}

        for row in stat_data:
            a_id, \
                a_status, \
                a_name, \
                a_type, \
                a_parent, \
                l_name, \
                order, \
                count = cls.attribute_item(row)

            target = prepared_stats.get(a_id)

            if not target: prepared_stats[a_id] = {
                "id": a_id,
                "levelName": l_name,
                "name": a_name,
                "parent": a_parent,
                "order": order,
                a_status: {a_type: count}
            }
            elif target.get(a_status):
                prev_count = target[a_status].get(a_type, 0)
                target[a_status][a_type] = prev_count + count
            else: target[a_status] = {a_type: count}

        for row in prepared_stats.values():
            try:
                parent = next((
                    parent for parent in prepared_stats.values()
                    if parent["id"] == row["parent"]
                ))
                parent["children"] = parent.get("children", []) + [row]
            except Exception: continue

        return sorted(
            filter(lambda r: not r.get("parent"), prepared_stats.values()),
            key=lambda r: r["order"]
        )

    @classmethod
    def _user_stat_adapt(cls, stats_data: list[dict[str, Any]]) -> list[dict[str, Any]]:
        prepared_stats = {}

        for row in stats_data:
            a_id, name, count, status, f_type = cls.user_item(row)

            target = prepared_stats.get(a_id)

            if not target: prepared_stats[a_id] = {
                "id": a_id,
                "name": name,
                status: {f_type: count}
            }
            elif target.get(status):
                prev_count = target[status].get(f_type) or 0
                target[status][f_type] = prev_count + count
            else: target[status] = {f_type: count}

        return list(prepared_stats.values())


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


def form_export_file(query: dict[str, Any]) -> BytesIO:
    query_set = {"type", "project_id", "choice"}
    choice_map = {
        "attribute": StatsServices.from_attribute,
        "user": StatsServices.from_user
    }
    export_map = {"json": JSON, "csv": CSV, "xlsx": XLS}

    assert not (
        no_ps := [p for p in query_set if not query.get(p)]
    ), f"{', '.join(no_ps)} must be provided"

    choice = query["choice"]
    project_id = query["project_id"]
    file_type = query["type"]

    assert file_type in IMPLEMENTED, f"{file_type} not implemented"
    assert choice in set(choice_map), f"export for {choice} is not implemented"

    stats, _ = choice_map[choice](project_id)
    file = export_map[file_type](stats, choice)

    return file.into_response()


def _get_duplicates(file_id: str) -> tuple[Any, int]:
    try:
        _file = File.objects.prefetch_related("file_set").get(id=file_id)
        return FileSerializer([_file, *_file.file_set.all()], many=True).data, HTTP_200_OK
    except Exception: return {}, HTTP_404_NOT_FOUND
