from attribute.models import Attribute, Level
from django.db import transaction
from typing import Optional

type UID = str
type Name = str
type Children = list[IRAttribute]

type IRAttribute = tuple[UID, Name, Children]


def write_attributes(
    parent,
    tree: list[IRAttribute],
    depth: int,
    levels: list[Level]
) -> tuple[list[IRAttribute], int, int]:
    unmatched = []
    total = 0
    total_unmatched = 0

    for attribute in tree:
        total += 1
        uid, name, children = attribute

        p_access = (
            parent.children
            if isinstance(parent, Attribute)
            else parent.attribute_set
        )

        _target = p_access.filter(name__icontains=name)
        target = None

        match _target.count():
            case 0:
                target = p_access.create(
                    level_id=levels[depth].id,
                    project_id=parent.project_id,
                    name=name,
                    payload={"sync_id": uid}
                )
                print(f"Created {name} for {parent.name}")
            case 1:
                target = _target.first()
                print(f"Found {name} for {parent.name}")
            case _:
                try:
                    target = p_access.get(name=name)
                    print(f"Found targeted {name} for {parent.name}")
                except:
                    target = (
                        p_access.filter(payload=uid)
                        or (
                            (
                                new_access.filter(payload=uid)
                                if (
                                    new_access :=
                                    _p.children
                                    if isinstance(_p := temp.first(), Attribute)
                                    else _p.attribute_set
                                ).filter(payload=uid)
                                else new_access.filter(name=name)
                            )
                            if  (
                                temp := parent.__class__.objects
                                .filter(project_id=parent.project_id, name=parent.name)
                                .exclude(id=parent.id)
                            ).count() == 1
                            else None
                        )
                    )

                    target = target.first() if (target and target.count() == 1) else None

                    if not target:
                        _count = lambda chn: len(chn) + sum([_count(ch[2]) for ch in chn])
                        total_unmatched += _count([attribute])
                        unmatched.append(attribute)
                        print(f"Many Found {name} for {parent.name}")
                    else: print(f"Found targeted {name} for {parent.name}")

        if target:
            target.payload = uid
            target.save()
            child_res = write_attributes(target, children, depth + 1, levels)
            unmatched.extend(child_res[0])
            total += child_res[1]

    return unmatched, total, total_unmatched


def raw_to_ir(
    header_size: int,
    rows: list[list[str]]
) -> tuple[list[IRAttribute], list[list[str]]]:
    from collections import defaultdict

    I = header_size - 1
    tree: defaultdict[Name, list[IRAttribute]] = defaultdict(list)
    failed: list[list[str]] = []

    while I > 0:
        acc = []
        shift = 1

        for row in rows:
            if len(row) != header_size: failed.append(row); continue

            if (val := row[I]) and (prev := row[I - shift]):
                key_a = "@".join(row[int(I != 1):I + int(I == 1)]) # prev + f"@{I-shift}"
                key_b = "@".join(row[1:I + 1]) # val + f"@{I}"
                tree[key_a].append((row[0], val, tree.pop(key_b, [])))
            else: acc.append(row)

        rows = acc
        I -= 1

    return [attrs[0] for attrs in tree.values()], failed


def map_levels(headers: list[str], project: int) -> tuple[list[Level], list[str]]:
    failed = []
    levels = []

    for h in headers[1:]:
        try:
            levels.append(
                Level.objects
                    .only("uid")
                    .get(project_id=project, name__icontains=h.strip())
            )
        except: failed.append(h)

    return levels, failed


def parse_file(
    file_path: str,
    sep: str,
    encoding: str
) -> tuple[list[str], list[list[str]]]:
    with open(file_path, "r", encoding=encoding, errors="ignore") as file:
        headers, *rows = [
            row.split(sep)
            for row in file.read().split("\n")
            if row
        ]
        return headers, rows


def main(file_path: str, sep: str, project: int, encoding="utf-8"):
    try:
        headers, rows = parse_file(file_path, sep, encoding)

        print(f"[1/5] Successfully parsed input file with {len(headers)} cols and {len(rows)} rows")

        ir_tree, ir_failed = raw_to_ir(len(headers), rows)
        print(f"[2/5] Make ir tree from input with {len(ir_failed)} failed\nDetailed: {ir_failed}")

        with transaction.atomic():
            levels, levels_failed = map_levels(headers, project)
            assert len(headers[:-1]) == len(levels), f"Levels unmatch with {levels_failed}"
            print(f"[3/5] Mapped input headers with DCT levels")

            print(f"Starting to map and write attributes...")
            unmatched, processed, unmatched_count = write_attributes(levels[0], ir_tree, 0, levels)

            print(f"[4/5] Attributes written with {processed} total and {unmatched_count} unmatched")
            print(f"Unmatched: {[(x[0], x[1]) for x in unmatched]}")


        print("[5/5] Saving...")

        # return (
        #     (headers, rows),
        #     (ir_tree, ir_failed),
        #     (levels, levels_failed),
        #     (unmatched, total)
        # )

    except Exception as e: print(f"[5/5] Process failed, rolling back...\nReason {str(e)}")


def main_from_export(file_path: str, sep: str, project: int, encoding="utf-8"):
    headers, rows = parse_file(file_path, sep, encoding)
    h_payload, h_attr, h_level, *_ = headers

    assert h_payload == "Payload"
    assert h_attr == "Attribute"
    assert h_level == "Level"

    level_cache = {}

    try:
        raise ValueError("unimplemented")
        with transaction.atomic():
            for row in rows:
                uid, name, level_name, *_ = row

                if not (level := level_cache.get(level_name)):
                    level = Level.objects.get(project_id=project, name=level_name)
                    level_cache[level_name] = level

                Attribute.objects.filter(project_id=project, name=name, payload__isnull=True)

        raise ValueError("debug rolback")

    except Exception as e:   print("Error: ", str(e))
