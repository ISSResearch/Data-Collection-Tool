from django.db import connection, transaction
from file.models import File
from attribute.models import Attribute


def migrate_files(
    target_project: int,
    dest_project: int,
    target_id: int,
    id_mapping: list[tuple[int, int]]
):
    with transaction.atomic():
        files = File.objects.filter(project_id=target_project, attributegroup__attribute__id=target_id)

        ag_id_list = tuple([
            str(uid) for uid
            in files.values_list("attributegroup__uid", flat=True).distinct()
        ])

        query_values = [
            (dest_id, ag_id_list, target_id)
            for target_id, dest_id
            in id_mapping
        ]

        assert ag_id_list
        assert query_values
        assert files.update(project_id=dest_project, rebound_project=target_project), "No File to update"

        update_attributes_query = """
            update attribute_group_attribute
            set attribute_id = %s
            where attributegroup_id in %s and attribute_id = %s;
        """

        with connection.cursor() as cursor:
            cursor.executemany(update_attributes_query, query_values)


def get_ids(sep: str, path_from: str, path_to: str) -> tuple[set[str], set[str]]:
    with open(path_from, "r") as f: data_from = f.read()
    with open(path_to, "r") as f: data_to = f.read()

    return (
        set([row.split(sep)[0] for row in data_from.split("\n") if row]),
        set([row.split(sep)[0] for row in data_to.split("\n") if row])
    )

def main(target: tuple[int, str], dest: tuple[int, str], sep: str):
    target_id, target_file = target
    dest_id, dest_file = dest

    target_set, dest_set = get_ids(sep, target_file, dest_file)

    print(f"[1/4] Parsed {len(target_set)} target ids, {len(dest_set)} dest ids")

    with transaction.atomic():
        for a_id in target_set.intersection(dest_set):
            dest_attribute = Attribute.objects.get(project_id=dest_id, payload=a_id)
            res = File.objects \
                .filter(project_id=target_id, attributegroup__attribute__payload=a_id) \
                .update(attributegroup__attribute_id=dest_attribute.id)
            print(f"[2/4] For {a_id} rebound id for a_group {res} files")

        for a_id in target_set - dest_set:
            dest_attribute = Attribute.objects.get(project_id=dest_id, payload=a_id)
            res = Attribute.objects \
                .get(project_id=target_id, payload=a_id) \
                .update(project_id=dest_id, level_id=dest_attribute.level_id)
            print(f"[3/4] For {a_id} new attr rebound prect and level")

        res = File.objects \
            .filter(project_id=target_id, attributegroup__attribute__payload__in=target_set) \
            .update(project_rebound=target_id, project_id=dest_id)
        print(f"[4/4] Rebound {res} total files to the new projects")
