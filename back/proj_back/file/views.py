from django.http import HttpResponse
from django.db.models import Count
from rest_framework.views import Response, APIView
from rest_framework.decorators import api_view
from rest_framework import status
from .serializers import File, FileSerializer
from .services import proceed_upload, prepare_zip_data
from os import remove
from time import time


class FileViewSet(APIView):
    http_method_names = ('get', 'patch')

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
    http_method_names = ('get', 'post')

    def get(self, request, projectID):
        files = File.objects \
            .select_related('author') \
            .prefetch_related('attribute') \
            .order_by('status').filter(project_id=projectID)

        response = FileSerializer(files, many=True)
        return Response(response.data, status=status.HTTP_200_OK)

    def post(self, request, projectID):
        response, res_status = {'ok': True}, status.HTTP_201_CREATED

        proceed_upload(request, projectID)

        return Response(response, status=res_status)


@api_view(('GET',))
def get_stats(request, projectID):
    stats = File.objects \
      .prefetch_related('attribute') \
      .filter(project_id=projectID) \
      .values('attribute__id', 'attribute__name', 'attribute__parent', 'status') \
      .annotate(count=Count('status'))
    return Response(stats, status=status.HTTP_200_OK)


# todo: perform a better way/class based if versatile will be needed
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
