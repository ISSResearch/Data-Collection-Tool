from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db import connection
from .serializers import File
from hashlib import md5
from os import path
from json import loads


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

    package = zip(files, meta)

    return [
        upload_file(file, meta, project_id, author_id)
        for file, meta in package
    ]


def create_files(file_instances):
    filtered_files = list(filter(lambda instace: bool(instace[0]), file_instances))

    created_files = File.objects.bulk_create(
        [file for file, _ in filtered_files]
    )

    process_data = zip(
        [file.id for file in created_files],
        [meta['atrsId'] for _, meta in filtered_files]
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


def upload_file(file, meta, project_id, author_id):
    byte_file = file.read()
    new_hash = md5(byte_file).digest()
    # if (len(File.objects.filter(hash_name=new_hash))): return

    prepared_meta = loads(meta)
    file_name = f'{prepared_meta["name"]}.{prepared_meta["extension"]}'
    save_path = path.join(str(project_id), file_name)
    file_path = default_storage.save(save_path, ContentFile(byte_file))

    return File(
        path=file_path,
        hash_name=new_hash,
        file_name=file_name,
        file_type=prepared_meta["type"],
        project_id=project_id,
        author_id=author_id
    ), prepared_meta
