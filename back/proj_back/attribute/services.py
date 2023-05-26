from django.db import transaction, IntegrityError


@transaction.atomic
def perform_level_delete(level):
    try:
        with transaction.atomic():
            for child_level in level.descendants().reverse():
                ...

    except IntegrityError as err: ...


@transaction.atomic
def perform_attribute_delete(attribute):
    try:
        with transaction.atomic():
            for child_attributes in attribute.descendants().reverse():
                ...

    except IntegrityError as err: ...
