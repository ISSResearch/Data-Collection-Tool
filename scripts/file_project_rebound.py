from django.db import connection, transaction
from file.models import File


def migrate_files(
    target_project: int,
    dest_project: int,
    id_mapping: list[tuple[int, int]]
):
    with transaction.atomic():
        files = File.objects.filter(project_id=target_project)

        assert files.update(project_id=dest_project, rebound_project=target_project), "No File to update"

        update_attributes_query = """
            update attribute_group_attribute
            set attribute_id = %s
            where attributegroup_id in %s and attribute_id = %s;
        """

        ag_id_list = tuple([
            str(uid) for uid
            in files.values_list("attributegroup__uid", flat=True).distinct()
        ])

        query_values = [
            (dest_id, ag_id_list, target_id)
            for target_id, dest_id
            in id_mapping
        ]

        with connection.cursor() as cursor:
            cursor.executemany(update_attributes_query, query_values)
