from project.models import Project
from attribute.models import ProjectGoal
from typing import Optional


def set_goals(
    project_id: int,
    goal_amount: int,
    image_mod=1,
    video_mod=1,
    filter_by_name: Optional[list[str]]=None,
    filter_by_group: Optional[list[int]]=None,
):
    form_name = lambda a: " > ".join([
        f"{name} ({level_name})"
        for name, level_name in
        a
        .ancestors(include_self=True)
        .values_list("name", "level__name")
    ])

    project = Project.objects.get(id=project_id)

    level_filter = project.level_set \
        .order_by("order") \
        .filter(parent__isnull=True) \

    if filter_by_name: level_filter = level_filter.filter(name__in=filter_by_name)
    if filter_by_group: level_filter = level_filter.filter(order__in=filter_by_group)

    level_filter = level_filter.values_list("order", flat=True)

    attributes = project.attribute_set \
        .prefetch_related("level") \
        .filter(level__order__in=level_filter, children__isnull=True) \
        .all()

    new_goals = [
        ProjectGoal(
            name=form_name(attr),
            amount=goal_amount,
            image_mod=image_mod,
            video_mod=video_mod,
            attribute=attr,
            project=project
        )
        for attr in attributes
    ]

    return new_goals

    # ProjectGoal.objects.bulk_create(new_goals)
