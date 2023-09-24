from django.db import connection
from .models import File
from attribute.models import AttributeGroup as AGroup
from json import loads


class FileUploader:
    __slots__ = {
        'project_id',
        'author_id',
        'files_meta',
        'attribute_groups_instances',
        'groups_taken',
        'new_instances',
        'created_files',
        'status'
    }

    def __init__(self, request, project_id):
        self.status = False

        self.project_id = project_id
        self.author_id = request.user.id
        self.files_meta = [
            loads(item)
            for item in request.POST.getlist('meta[]')
        ]

        self.attribute_groups_instances = list()
        self.groups_taken = 0
        self.new_instances = list()
        self.created_files = list()

    def proceed_upload(self):
        self \
            .get_attribute_groups_instances() \
            .get_file_instances() \
            .write_files() \
            .assign_attributes() \
            .set_created()
        self.status = True

    def get_attribute_groups_instances(self):
        required_length = self._get_attributes_groups_amount()

        available_groups = list(AGroup.get_free_groups())
        new_groups = AGroup.objects.bulk_create(
            [AGroup() for _ in range(required_length - len(available_groups))],
            batch_size=400
        )
        available_groups.extend(new_groups)

        self.attribute_groups_instances = available_groups[:required_length]

        return self

    def get_file_instances(self):
        file_instances = [self._upload_file(meta) for meta in self.files_meta]
        self.new_instances.extend(file_instances)

        return self

    def write_files(self):
        File.objects.bulk_create(
            [file for file, _, _ in self.new_instances],
            batch_size=100
        )
        AGroup.objects.bulk_update(
            [
                group
                for _, file_groups, _ in self.new_instances
                for group in file_groups
            ],
            ['file_id'],
            batch_size=300
        )
        return self

    def assign_attributes(self):
        query = """
            insert into attribute_group_attribute
            (attributegroup_id, attribute_id)
            values (%s, %s)
            on conflict do nothing;
        """

        prepared_query = [
            (file_groups[i], file_meta[i])
            for _, file_groups, file_meta in self.new_instances
            for i in range(len(file_groups))
        ]

        query_values = [
            (group_id.uid, attribute_id)
            for group_id, attributes in prepared_query
            for attribute_id in attributes
        ]

        with connection.cursor() as cur: cur.executemany(query, query_values)

        return self

    def set_created(self):
        self.created_files.extend([file for file, _, _ in self.new_instances])

    def _get_attributes_groups_amount(self):
        return sum([len(meta.get('atrsGroups', [])) for meta in self.files_meta])

    def _upload_file(self, meta):
        file_groups_count = len(meta.get('atrsGroups', []))

        file = File(
            file_name=f'{meta["name"]}.{meta["extension"]}',
            file_type=meta.get("type", 'file'),
            project_id=self.project_id,
            author_id=self.author_id,
        )

        file_groups = self._assign_groups(file, file_groups_count)

        return file, file_groups, meta.get('atrsGroups', [])

    def _assign_groups(self, file, groups_count):
        file_groups = list()

        for group in self.attribute_groups_instances[self.groups_taken:self.groups_taken + groups_count]:
            group.file = file
            file_groups.append(group)

        self.groups_taken += groups_count

        return file_groups
