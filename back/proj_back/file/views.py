from django.http import HttpResponse
from django.db.models import Count
from rest_framework.views import Response, APIView
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import File, FileSerializer, FilesSerializer
from attribute.models import Level
from .services import FileUploader, prepare_zip_data, upload_chunk
from os import remove
from time import time


class FileViewSet(APIView):
    http_method_names = ('get', 'patch', 'delete')

    def get(self, _, fileID):
        file = File.objects.get(id=fileID)

        return HttpResponse(file.path.read(), content_type='image/jpeg')

    def patch(self, request, fileID):
        file = File.objects \
            .select_related('author') \
            .prefetch_related('attributegroup_set') \
            .get(id=fileID)
        updated_file = FileSerializer(file, request.data, partial=True)
        update_valid = updated_file.is_valid()

        if update_valid: updated_file.update_file()

        response = {'ok': update_valid}

        if not update_valid: response['errors'] = updated_file.errors
        response_status = status.HTTP_202_ACCEPTED if update_valid else status.HTTP_400_BAD_REQUEST

        return Response(response, status=response_status)

    def delete(self, _, fileID):
        try:
            file = File.objects.get(id=fileID)
            file.attributegroup_set.clear()
            file.delete()

            return Response({'deleted': True}, status=status.HTTP_202_ACCEPTED)

        except Exception:
            return Response({'deleted': False}, status=status.HTTP_400_BAD_REQUEST)


class FilesViewSet(APIView):
    http_method_names = ('get', 'post')
    # TODO: changed - revise tests
    def get(self, request, projectID):
        accepted_queries = (
            ('status__in', 'card[]'),
            ('attributegroup__attribute__in', 'attr[]'),
            ('file_type__in', 'type[]')
        )

        filter_query = {'project_id': projectID}

        for filter_name, param in  accepted_queries:
            query_param = request.query_params.getlist(param)
            if query_param: filter_query[filter_name] = query_param

        files = File.objects \
            .select_related('author') \
            .prefetch_related('attributegroup_set') \
            .order_by('-status', '-upload_date') \
            .filter(**filter_query)

        response = FileSerializer(files, many=True)
        return Response(response.data, status=status.HTTP_200_OK)

    def post(self, request, projectID):
        uploader = FileUploader(request, projectID)
        uploader.proceed_upload()

        response = {'ok': uploader.status}
        res_status = status.HTTP_201_CREATED if uploader.status else status.HTTP_500_INTERNAL_SERVER_ERROR

        if (uploader.status):
            response['created_files'] = FilesSerializer(uploader.created_files, many=True).data

        return Response(response, status=res_status)


@api_view(('GET',))
def get_stats(_, projectID):
    stats = Level.objects \
        .filter(project_id=projectID) \
        .order_by('order', 'id') \
        .values(
            'name',
            'order',
            'attribute__id',
            'attribute__name',
            'attribute__parent',
            'attribute__attributegroup__file__file_type',
            'attribute__attributegroup__file__status'
        ) \
        .annotate(count=Count('attribute__attributegroup__file__file_type'))

    empty_attributes_files = File.objects \
        .filter(project_id=projectID, attributegroup__isnull=False) \
        .values('file_type', 'status') \
        .annotate(file_count=Count('file_type'), attribute_count=Count('attributegroup__attribute')) \
        .filter(attribute_count=0)

    empty_attributegroups_files = File.objects \
        .filter(project_id=projectID, attributegroup__isnull=True) \
        .annotate(file_count=Count('file_type'), attribute_count=Count('attributegroup')) \
        .values('file_type', 'status', 'file_count') \
        .filter(attribute_count=0)

    empty_stats = [
        {
            'name': 'no level',
            'attribute__name': 'No attribute',
            'attribute__parent': None,
            'attribute__id': 'no-id',
            'attribute__attributegroup__file__file_type': entry['file_type'],
            'attribute__attributegroup__file__status': entry['status'],
            'count': entry['file_count']
        }
        for entry in tuple(empty_attributes_files) + tuple(empty_attributegroups_files)
    ]

    if empty_stats: stats = list(stats) + list(empty_stats)

    return Response(stats, status=status.HTTP_200_OK)


@api_view(('GET',))
def download_project_data(request, projectID):
    files_query = request.query_params.get('files')
    files_filter = {'', 'a', 'd'}

    if files_query in {'validation', 'accepted', 'declined'}:
        files_filter = {'' if files_query == 'validation' else files_query[0]}

    files = File.objects \
        .select_related('author', 'project') \
        .prefetch_related('attribute') \
        .filter(project_id=projectID, status__in=files_filter)

    if not len(files): return Response(status=status.HTTP_204_NO_CONTENT)

    serialized_data = FileSerializer(files, many=True).data
    zip_name = f"proj_{projectID}_{int(time())}_data_set.zip"

    zip_location = prepare_zip_data(files, serialized_data, zip_name)

    response = HttpResponse(content_type="application/zip")
    with open(zip_location, "rb") as new_zip: response.write(new_zip.read())

    remove(zip_location)

    return response


@api_view(('POST',))
def upload_file_chunk(request, fileID):
    response, response_status = upload_chunk(request, fileID)
    return Response(response, status=response_status)
