from attribute.models import Attribute, Level
from django.db import connection, transaction
from typing import Optional
from collections import Counter

# from merge_attributes import *; w = main(9)


def traverse(access):
    data = access.values_list("name", flat=True)
    count = Counter(data)

    unmatched = []

    for name, cnt in count.items():
        if cnt <= 1: continue
        try:
            print(f"Trying {name}", end=" ")
            assert cnt == 2, "Unexpected Count"

            a_from, a_to = access.filter(name=name)
            if a_from.payload != None: a_from, a_to = a_to, a_from

            # a_to = access.get(name=name, payload__isnull=False)
            # a_from = access.get(name=name, payload__isnull=True)

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

            unmatched.extend(traverse(a_to.children))

        except Exception as e: unmatched.append((name, cnt, str(e)))

    return unmatched


def main(project: int, from_order: int = 0):
    try:
        with transaction.atomic():
            for level in Level.objects.filter(project_id=project, parent=None):
                print(f"\n[1/2] Run for {level.name} level")
                unmatched = traverse(level.attribute_set)
                print(f"[2/2] Ran with {len(unmatched)} failed")
                print("Detailed:", unmatched)

            raise ValueError("debug rollback")

    except Exception as e: print("Err: " + str(e))
