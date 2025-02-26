from attribute.models import Attribute, Level
from django.db import connection, transaction, Count
from typing import Optional
from collections import Counter

def traverse_from_targeted(_a_from: int, _a_to: int):
    a_from = Attribute.objects.get(id=_a_from)
    a_to = Attribute.objects.get(id=_a_to)

    unmatched = []

    try:
        with transaction.atomic():
            with connection.cursor() as cursor: cursor.execute(
                """
                    update attribute_group_attribute
                    set attribute_id = %s
                    where attribute_id = %s;
                """,
                [a_to.id, a_from.id]
            )

            a_from.children.update(parent_id=a_to.id, level_id=a_to.level_id)
            a_from.projectgoal_set.update(attribute_id=a_to.id)

            assert not a_from.children.count(), "Children not remapped"
            assert not a_from.attributegroup_set.count(), "Attribute group not remapped"
            assert not a_from.projectgoal_set.count(), "Projectgoal not remapped"
            assert (d := a_from.delete())[0] == 1, "Unexpected delete"

            return 0, traverse(a_to.children)

    except Exception as e: return 1, str(e)


def remove_by_id(uid: str) -> tuple[str, str]:
    try:
        with transaction.atomic():
            query = Attribute.objects.filter(payload=uid)

            assert query.count() == 2, "Count != 2"

            a_from, a_to = query

            assert not a_from.children.count(), "Attr has Children"

            with connection.cursor() as cursor: cursor.execute(
                """
                    update attribute_group_attribute
                    set attribute_id = %s
                    where attribute_id = %s;
                """,
                [a_to.id, a_from.id]
            )

            a_from.projectgoal_set.update(attribute_id=a_to.id)

            assert not a_from.attributegroup_set.count(), "Attribute group not remapped"
            assert not a_from.projectgoal_set.count(), "Projectgoal not remapped"
            assert (d := a_from.delete())[0] == 1, "Unexpected delete"

        return None
    except Exception as e: return (uid, str(e))



def traverse(
    access,
    access_by: str = "name",
    once: bool = False
) -> list[tuple[str, int, str]]:
    data = access.values_list(access_by, flat=True)
    count = Counter(data)

    unmatched = []

    for name, cnt in count.items():
        if cnt <= 1: continue
        try:
            print(f"Trying {name}", end=" ")
            assert cnt == 2, "Unexpected Count"

            a_from, a_to = access \
                .filter(**{access_by: name}) \
                .annotate(ag_count=Count("attributegroup")) \
                .order_by("ag_count")
                
            if a_from.payload != None: a_from, a_to = a_to, a_from

            print("from " + a_to.parent.name if a_to.parent else "")

            with connection.cursor() as cursor: cursor.execute(
                """
                    update attribute_group_attribute
                    set attribute_id = %s
                    where attribute_id = %s;
                """,
                [a_to.id, a_from.id]
            )

            a_from.children.update(parent_id=a_to.id, level_id=a_to.level_id)
            a_from.projectgoal_set.update(attribute_id=a_to.id)

            assert not a_from.children.count(), "Children not remapped"
            assert not a_from.attributegroup_set.count(), "Attribute group not remapped"
            assert not a_from.projectgoal_set.count(), "Projectgoal not remapped"
            assert (d := a_from.delete())[0] == 1, "Unexpected delete"

            print(f"Deleted {name} {d}")

            if not once: unmatched.extend(traverse(a_to.children, access_by))

        except Exception as e: unmatched.append((name, cnt, str(e)))

    return unmatched


def main(
    project: int,
    traverse_by: str = "name",
    once: bool = False,
):
    try:
        with transaction.atomic():
            for level in Level.objects.filter(project_id=project, parent=None):
                print(f"\n[1/2] Run for {level.name} level")
                unmatched = traverse(level.attribute_set, traverse_by, once)
                print(f"[2/2] Ran with {len(unmatched)} failed")
                print("Detailed:", unmatched)

    except Exception as e: print("Err: " + str(e))
