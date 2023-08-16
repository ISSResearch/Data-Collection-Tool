from django.db import transaction, IntegrityError
from file.models import File


@transaction.atomic
def perform_level_delete(level):
    project_id = level.project_id
    current_file_attributes = set(
        # TODO: optimize query
        File.objects
            .filter(project_id=project_id)
            .values_list('attributegroup__attribute', flat=True)
    )
    level_delete_attributes = set(
        level.descendants().reverse().values_list('attribute', flat=True)
    )
    # TODO: optimize query
    level_delete_attributes = level_delete_attributes.union(level.attribute_set.values_list('id', flat=True))

    if current_file_attributes.intersection(level_delete_attributes): return

    try:
        with transaction.atomic():
            for child_level in level.descendants().reverse():
                child_level.attribute_set.all().delete()
                child_level.delete()

            level.attribute_set.all().delete()
            level.delete()
        return True

    except IntegrityError: return


def check_level_delete(level):
    project_id = level.project_id
    current_file_attributes = set(
        # TODO: optimize query
        File.objects
            .filter(project_id=project_id)
            .values_list('attributegroup__attribute', flat=True)
    )
    level_delete_attributes = set(
        level.descendants().reverse().values_list('attribute', flat=True)
    )
    # TODO: optimize query
    level_delete_attributes = level_delete_attributes.union(level.attribute_set.values_list('id', flat=True))

    if current_file_attributes.intersection(level_delete_attributes): return

    return True


@transaction.atomic
def perform_attribute_delete(attribute):
    project_id = attribute.project_id
    current_file_attributes = set(
        File.objects
        # TODO: optimize query
            .filter(project_id=project_id)
            .values_list('attributegroup__attribute', flat=True)
    )
    delete_attributes = set(
        # TODO: optimize query
        attribute.descendants().values_list('id', flat=True)
    )
    delete_attributes.add(attribute.id)

    if current_file_attributes.intersection(delete_attributes): return

    try:
        with transaction.atomic():
            attribute.descendants().delete()
            attribute.delete()
        return True

    except IntegrityError: return


def check_attribute_delete(attribute):
    project_id = attribute.project_id
    current_file_attributes = set(
        # TODO: optimize query
        File.objects
            .filter(project_id=project_id)
            .values_list('attributegroup__attribute', flat=True)
    )
    delete_attributes = set(
        # TODO: optimize query
        attribute.descendants().values_list('id', flat=True)
    )
    delete_attributes.add(attribute.id)

    if current_file_attributes.intersection(delete_attributes): return

    return True
