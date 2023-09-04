from django.core.files.storage import default_storage as storage
from django.db import connection
from django.http import FileResponse
from rest_framework import status
from .models import File
from attribute.models import AttributeGroup as AGroup
from os import path, mkdir
from json import loads
from re import compile, I
from os import SEEK_SET


class FileStreaming:
    slots = (
        'RANGE_RE',
        'CHUNK_SIZE',
        'file',
        'file_size',
        'content_type',
        'range_match',
        'chunk_start',
        'chunk_end',
        'chunk_length'
    )
    RANGE_RE = compile(r"bytes\s*=\s*(\d+)\s*-\s*(\d*)", I)
    MB_MULTIPLIER = 4
    CHUNK_SIZE = 1024 * MB_MULTIPLIER

    def __init__(self, file):
        self.file = file
        self.file_size = self.file.path.size
        self.content_type = self._get_file_type()
        self._set_chunks()

    def get_reponse(self, request):
        self.range_match = self._get_range_match(request)

        if self.range_match:
            self._set_chunks()

            response = FileResponse(iter(self), status=206)
            response['Content-Range'] = f'bytes {self.chunk_start}-{self.chunk_end}/{self.file_size}'

        else: response = FileResponse(self.file.path.open())

        response['Content-Type'] = self.content_type
        response['Accept-Ranges'] = 'bytes'

        return response

    def __iter__(self): return self._file_iterator()

    def _file_iterator(self):
        with self.file.path.open() as file:
            file.seek(self.chunk_start, SEEK_SET)
            remaining_chunk = self.chunk_length

            while True:
                bytes_length = (
                    self.CHUNK_SIZE
                    if remaining_chunk is None
                    else min(remaining_chunk, self.CHUNK_SIZE)
                )
                data = file.read(bytes_length)

                if not data: break
                if remaining_chunk: remaining_chunk -= len(data)

                yield data

    def _get_file_type(self):
        if '.' not in self.file.file_name: return self.file.file_type

        type = self.file.file_name.split('.')[-1]
        return f'{self.file.file_type}/{type}'

    def _get_range_match(self, request):
        range_header = request.headers.get('range', '')
        return self.RANGE_RE.match(range_header)

    def _set_chunks(self):
        chunk_start, chunk_end = (
            self.range_match.groups()
            if self.__dict__.get('range_match')
            else (0, 0)
        )

        chunk_start = int(chunk_start) if chunk_start else 0
        chunk_end = (
            int(chunk_end) if chunk_end
            else chunk_start + 1024 * 1024 * self.MB_MULTIPLIER
        )

        if chunk_end >= self.file_size: chunk_end = self.file_size - 1

        chunk_length = chunk_end - chunk_start + 1

        self.chunk_start = chunk_start
        self.chunk_end = chunk_end
        self.chunk_length = chunk_length


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
        # byte_file = file.read()
        # new_hash = md5(byte_file).digest()
        # if (len(File.objects.filter(hash_name=new_hash))): return

        file_name, save_path = self._make_file_name(
            meta["name"],
            meta["extension"]
        )

        if not storage.exists(storage.location): mkdir(storage.location)

        if not storage.exists(str(self.project_id)):
            mkdir(f'{storage.location}/{self.project_id}')
        # with open(save_path, 'bw'): pass
        # file_path = storage.save(save_path, ContentFile(byte_file))

        file_groups_count = len(meta.get('atrsGroups', []))

        file = File(
            path=save_path,
            # hash_name=new_hash,
            file_name=file_name,
            file_type=meta.get("type", 'file'),
            file_extension=meta['extension'],
            project_id=self.project_id,
            author_id=self.author_id,
        )

        file_groups = self._assign_groups(file, file_groups_count)

        return file, file_groups, meta.get('atrsGroups', [])

    def _make_file_name(self, file_name, file_extension):
        real_name = storage.generate_filename(file_name).replace('.', '_')
        save_path = path.join(storage.location, str(self.project_id), f'{real_name}.{file_extension}')

        if not path.exists(save_path):
            save_name = f'{real_name}.{file_extension}'
        else:
            copy_count = 0
            while path.exists(save_path):
                copy_count += 1
                save_path = path.join(
                    storage.location,
                    str(self.project_id),
                    f'{real_name}_{copy_count}.{file_extension}'
                )
            save_name = f'{real_name}_{copy_count}.{file_extension}'

        return save_name, save_path

    def _assign_groups(self, file, groups_count):
        file_groups = list()

        for group in self.attribute_groups_instances[self.groups_taken:self.groups_taken + groups_count]:
            group.file = file
            file_groups.append(group)

        self.groups_taken += groups_count

        return file_groups


def upload_chunk(request, file_id):
    chunk = request.META.get('HTTP_CHUNK')
    total_chunks = request.META.get('HTTP_TOTAL_CHUNKS')
    file_chunk = request.data.get('chunk')

    response = {
        'chunk': chunk,
        'success': True,
        'transfer_complete': total_chunks == chunk
    }
    response_status = status.HTTP_202_ACCEPTED

    try:
        file = File.objects.get(id=file_id)
        with open(file.path.path, 'ba') as f: f.write(file_chunk.read())
    except Exception:
        response['success'] = False
        response_status = status.HTTP_400_BAD_REQUEST

    return response, response_status
