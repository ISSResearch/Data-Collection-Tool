from django.db import connection, transaction
from file.models import File
from attribute.models import Attribute, Level


def migrate_third_attrs(target: int, dest: int, from_order: int = 1):
    attr_data = File.objects \
        .filter(
            project_id=dest,
            rebound_project=target,
            attributegroup__attribute__project_id=target,
            attributegroup__attribute__level__order__gte=from_order
        ) \
        .values_list(
            "attributegroup__uid",
            "attributegroup__attribute__id",
            "attributegroup__attribute__name",
            "attributegroup__attribute__project_id",
            "attributegroup__attribute__level__order"
        ) \
        .distinct()
    print(f"[1/4] Found {attr_data.count()} attrs to migrate")

    rebound = []
    created = 0
    failed = []

    cache = {}

    for ag_id, a_id, a_name, p_id, l_order in attr_data:
        ag_id = str(ag_id)

        if p_id != target: continue

        if (cached := cache.get((a_id, a_name))):
            print(f"[2/4] Cached {a_name}")
            rebound.append((cached, a_id, ag_id,))
            continue

        try:
            map_id = Attribute.objects.filter(project_id=dest, name=a_name).id
            rebound.append((map_id, a_id, ag_id))
            cache[(a_id, a_name)] = map_id
            print(f"[2/4] Found {a_name} in dest")
        except:
            levels = Level.objects.filter(project_id=dest, order=l_order)
            if levels.count() == 1:
                map_id = levels.first().attribute_set.create(name=a_name, project_id=dest).id
                rebound.append((map_id, a_id, ag_id))
                created += 1
                cache[(a_id, a_name)] = map_id
                print(f"[2/4] Created {a_name} in dest")
            else: failed.append((a_id, a_name))

    print(f"[3/4] Got {len(rebound)} attributes with {created} created")

    with connection.cursor() as cursor: cursor.executemany(
        """
            update attribute_group_attribute
            set attribute_id = %s
            where attribute_id = %s and attributegroup_id = %s;
        """,
        rebound
    )

    print(f"[4/4] Migrate done with {len(failed)} failed")


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
        set([row.split(sep)[0] for row in data_from.split("\n")[1:] if row]),
        set([row.split(sep)[0] for row in data_to.split("\n")[1:] if row])
    )


def main(target: tuple[int, str], dest: tuple[int, str], sep: str):
    target_id, target_file = target
    dest_id, dest_file = dest

    target_set, dest_set = get_ids(sep, target_file, dest_file)

    print(f"[1/4] Parsed {len(target_set)} target ids, {len(dest_set)} dest ids")

    get_id = lambda pr, pl: Attribute.objects.only("id").get(project_id=pr, payload=pl).id
    get_level = lambda n: Level.objects.only('id').get(project_id=dest_id, name=n).id

    with transaction.atomic():
        with connection.cursor() as cursor:
            cursor.executemany(
                "update attribute_group_attribute set attribute_id = %s where attribute_id = %s;",
                qv := [
                    (get_id(dest_id, a_id), get_id(target_id, a_id))
                    for a_id
                    in target_set.intersection(dest_set)
                ]
            )

        print(f"[2/4] rebounded id for a_group {len(qv)} attributes")

        create_acc = 0
        for a_id in target_set - dest_set:
            attr = Attribute.objects.get(project_id=target_id, payload=a_id)
            attr.project_id=dest_id
            attr.level_id = get_level(attr.level.name)
            attr.save()
            create_acc += 1
        print(f"[3/4] For {create_acc} new attr rebound prect and level")

        res = File.objects \
            .filter(project_id=target_id, attributegroup__attribute__payload__in=target_set) \
            .update(rebound_project=target_id, project_id=dest_id)
        print(f"[4/4] Rebound {res} total files to the new projects")

        # migrate_third_attrs(target_id, dest_id, 1)
