from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.db import connection
from django.http import HttpResponse
from rest_framework.views import Response, APIView
from rest_framework import status
from hashlib import md5
from os import path
from json import loads
from .serializers import File, FileSerializer


class FileViewSet(APIView):
    http_method_names = ['get','patch']

    def get(self, request, fileID):
        file = File.objects.get(id=fileID)
        return HttpResponse(file.path.read(), content_type='image/jpeg')

    def patch(self, request, fileID):
        file = File.objects.get(id=fileID)
        updated_file = FileSerializer(file, request.data, partial=True)
        update_valid = updated_file.is_valid()
        if update_valid: updated_file.update_file()
        response = {'ok': update_valid}
        if not update_valid: response['errors'] = updated_file.errors
        response_status = status.HTTP_202_ACCEPTED if update_valid else status.HTTP_400_BAD_REQUEST
        return Response(response, status=response_status)


class FilesViewSet(APIView):
    http_method_names = ['get',  'post' ]

    def get(self, request, projectID):
        files = File.objects \
            .select_related('author') \
            .prefetch_related('attribute') \
            .order_by('status').filter(project_id=projectID)
        response = FileSerializer(files, many=True)
        return Response(response.data, status=status.HTTP_200_OK)

    def post(self, request, projectID):
        response, res_status = handle_upload(request, projectID)
        return Response(response, status=res_status)

# TODO: move these out
def handle_upload(request, projectID):
    response, res_status = {'ok': True}, status.HTTP_201_CREATED

    package_meta = {
        'project': projectID,
        'author': request.user.id,
    }
    files_data = request.FILES.getlist('files[]')
    files_meta = request.POST.getlist('meta[]')

    file_instances = gather_instances(files_data, files_meta, package_meta)

    create_files(file_instances)

    return response, res_status


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
