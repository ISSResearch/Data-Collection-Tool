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

    with ZipFile(zip_location, mode="w", compression=ZIP_DEFLATED) as zp:
        for file in files: zp.write(file.path.path, arcname=file.file_name)

        json_data = dumps(serialized_data, indent=4).encode('utf-8')

        with NamedTemporaryFile() as temp_json:
          temp_json.write(json_data)
          temp_json.seek(0)
          zp.write(temp_json.name, arcname='annotation.json')

    return zip_location


# TODO: handle errors and think 'bout how (atomic-like or skip failed ones)
def proceed_upload(request, projectID):
    package_meta = {
        'project': projectID,
        'author': request.user.id,
    }
    files_data = request.FILES.getlist('files[]')
    files_meta = request.POST.getlist('meta[]')

    file_instances = gather_instances(files_data, files_meta, package_meta)

    create_files(file_instances)


def gather_instances(files, meta, package_meta):
    project_id = package_meta['project']
    author_id = package_meta['author']

    attribute_groups = get_attribute_groups(len(files))

    package = zip(files, attribute_groups, meta)

    return [
        upload_file(file, attribute_groups.pop(), meta, project_id, author_id)
        for file, meta in package
    ]


def get_attribute_groups(length):
    free_groups = AGroup.get_free_groups()

    new_groups = AGroup.objects.bulk_create(
        {AGroup() for _ in range(length - free_groups.count())}
    )

    return set(free_groups).union(new_groups)


def create_files(file_instances):
    filtered_files = list(filter(lambda instace: bool(instace[0]), file_instances))

    created_files = File.objects.bulk_create(
        [file for file, _, _ in filtered_files]
    )

    created_groups = AGroup.objects.bulk_create(
        [group for _, group, _ in filtered_files]
    )

    process_data = zip(
        [file.id for file in created_files],
        [meta['atrsId'] for _, _, meta in filtered_files]
    )

    query = """
        insert into file_attribute
        (file_id, attribute_id)
        values (%s, %s)
        on conflict do nothing;
    """
    query_values = [
        (file_id, attribute_id)
        for file_id, attributes in process_data
        for attribute_id in attributes
    ]

    with connection.cursor() as cur: cur.executemany(query, query_values)


def upload_file(file, group, meta, project_id, author_id):
    byte_file = file.read()
    new_hash = md5(byte_file).digest()
    # if (len(File.objects.filter(hash_name=new_hash))): return

    prepared_meta = loads(meta)
    file_name = f'{prepared_meta["name"]}.{prepared_meta["extension"]}'
    save_path = path.join(str(project_id), file_name)
    file_path = default_storage.save(save_path, ContentFile(byte_file))

    file = File(
        path=file_path,
        hash_name=new_hash,
        file_name=file_name,
        file_type=prepared_meta["type"],
        project_id=project_id,
        author_id=author_id,
    )
    group.file = file

    return file, group, prepared_meta
