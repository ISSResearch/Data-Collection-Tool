from django.core.management.base import BaseCommand
from django.db import connection, transaction, IntegrityError
from file.models import File
from attribute.models import AttributeGroup as AGroup


class Command(BaseCommand):
    help = """
        apply attributes migration to file model
        from file_attributes to attribute_group_attributes
    """

    _set_group_attribute_query = """
        insert into attribute_group_attribute
        (attributegroup_id, attribute_id)
        values (%s, %s)
    """

    _set_group_file_query = """
        update attribute_group
        set file_id=%s where uid=%s
    """

    _clear_file_attribute_query = """
      delete from file_attribute
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.migration_data = list()
        self.attribute_group_instances = list()

    @transaction.atomic
    def handle(self, *args, **kwargs):
        self.stdout.write('Starting migration...')

        self._gather_migration_data()
        self._gather_attributes_group()

        try:
            with transaction.atomic():
                self.assign_attributes_groups()
                self.unlink_attirbute()
                self.handle_empty_attributes_files()
            self.stdout.write('Migration completed!')

        except IntegrityError as err:
            self.stdout.write(err)
            self.stdout.write('Breaking process...')

    def handle_empty_attributes_files(self):
        self.stdout.write('Assigning attribute group to empty attr files...')

        files_with_empty_attirubtes = File.objects \
            .filter(attribute__isnull=True, attributegroup__isnull=True) \
            .values_list('id', flat=True)
        # TODO: optimize query ^

        self._gather_attributes_group(files_with_empty_attirubtes.count())
        free_groups_ids = {group.uid for group in self.attribute_group_instances}

        query_values = set(zip(files_with_empty_attirubtes, free_groups_ids))

        with connection.cursor() as cursor:
            cursor.executemany(self._set_group_file_query, query_values)

    def assign_attributes_groups(self):
        self.stdout.write('Assigning Attribute Groups...')

        perform_set = [
            (
                str(self.attribute_group_instances.pop().uid),
                file.id,
                [attirubte.id for attirubte in file.attribute.all()]
            )
            for file in set(self.migration_data)
        ]

        group_attribute_query_values = [
            (group_id, attribute_id)
            for group_id, _, attributes in perform_set
            for attribute_id in attributes
        ]

        group_file_query_values = {
            (file_id, group_id)
            for group_id, file_id, _ in perform_set
        }

        with connection.cursor() as cursor:
            self.stdout.write('1/2: Assigning groups to attributes...')
            cursor.executemany(
                self._set_group_attribute_query,
                group_attribute_query_values
            )

            self.stdout.write('2/2: Assigning groups to files...')
            cursor.executemany(
                self._set_group_file_query,
                group_file_query_values
            )

    def unlink_attirbute(self):
        self.stdout.write('Unlinking attributes from file...')

        with connection.cursor() as cursor:
            cursor.execute(self._clear_file_attribute_query)

    def _gather_migration_data(self):
        self.stdout.write('Gathering migration data...')

        self.migration_data = File.objects \
            .prefetch_related('attribute') \
            .filter(attribute__isnull=False, attributegroup__isnull=True)

    def _gather_attributes_group(self, ln=None):
        self.stdout.write('Forming new attirubte groups...')

        available_groups = list(AGroup.get_free_groups())

        new_groups = AGroup.objects.bulk_create(
            [
                AGroup() for _
                in range((ln or self.migration_data.count()) - len(available_groups))
            ],
            batch_size=400
        )

        self.attribute_group_instances = available_groups + new_groups
