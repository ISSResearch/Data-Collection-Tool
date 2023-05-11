from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db import connection
from .serializers import File
from attribute.models import AttributeGroup as AGroup
from hashlib import md5
from os import path, mkdir
from json import loads, dumps
from tempfile import NamedTemporaryFile
from zipfile import ZipFile, ZIP_DEFLATED


def prepare_zip_data(files, serialized_data, zip_name):
    store_location = default_storage.location + '/temp/'

    if not path.exists(store_location): mkdir(store_location)

    zip_location = store_location + zip_name

    filtered_files = tuple(filter(lambda f: f.path, files))

    with ZipFile(zip_location, mode="w", compression=ZIP_DEFLATED) as zp:
        for file in filtered_files: zp.write(file.path.path, arcname=file.file_name)

        json_data = dumps(serialized_data, indent=4).encode('utf-8')

        with NamedTemporaryFile() as temp_json:
          temp_json.write(json_data)
          temp_json.seek(0)
          zp.write(temp_json.name, arcname='annotation.json')

    return zip_location


# TODO: handle errors and think 'bout how (atomic-like or skip failed ones)
class FileUploader:
    __slots__ = {
        'project_id',
        'author_id',
        'files_data',
        'files_meta',
        'attribute_groups_instances',
        'groups_taken',
        'new_instances',
        'status'
    }

    def __init__(self, request, project_id):
        self.status = False

        self.project_id = project_id
        self.author_id = request.user.id
        self.files_data = request.FILES.getlist('files[]')
        self.files_meta = [
            loads(item)
            for item in request.POST.getlist('meta[]')
        ]

        self.attribute_groups_instances = list()
        self.groups_taken = 0
        self.new_instances = list()

    def proceed_upload(self):
        try:
            self \
              .get_attribute_groups_instances() \
              .get_file_instances() \
              .write_files() \
              .assign_attributes()
            self.status = True
        except: ...

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
        package_data = zip(self.files_data, self.files_meta)

        file_instances = [
            self._upload_file(file, meta)
            for file, meta in package_data
            if bool(file)
        ]
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

    def _get_attributes_groups_amount(self):
        return sum([len(meta.get('atrsGroups', [])) for meta in self.files_meta])

    def _upload_file(self, file, meta):
        byte_file = file.read()
        new_hash = md5(byte_file).digest()
        # if (len(File.objects.filter(hash_name=new_hash))): return

        file_name = f'{meta["name"]}.{meta["extension"]}'
        save_path = path.join(str(self.project_id), file_name)
        file_path = default_storage.save(save_path, ContentFile(byte_file))

        file_groups_count = len(meta.get('atrsGroups', []))

        file = File(
            path=file_path,
            hash_name=new_hash,
            file_name=file_name,
            file_type=meta["type"],
            project_id=self.project_id,
            author_id=self.author_id,
        )

        file_groups = self._assign_groups(file, file_groups_count)

        return file, file_groups, meta.get('atrsGroups', [])

    def _assign_groups(self, file, groups_count):
        file_groups = list()

        for group in self.attribute_groups_instances[self.groups_taken:self.groups_taken+groups_count]:
            group.file = file
            file_groups.append(group)

        self.groups_taken += groups_count

        return file_groups
