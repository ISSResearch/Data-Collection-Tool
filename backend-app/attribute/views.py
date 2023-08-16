from rest_framework.views import Response, APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .permissions import LevelPermission, AttributePermission
from .serializers import Level, Attribute
from .services import (
    perform_level_delete,
    check_level_delete,
    perform_attribute_delete,
    check_attribute_delete
)


class LevelsViewSet(APIView):
    http_method_names = ('get', 'delete')
    permission_classes = (IsAuthenticated, LevelPermission)

    def get(self, _, levelID):
        response = None
        response_status = status.HTTP_200_OK

        try:
            result = check_level_delete(Level.objects.get(id=levelID))
            response = {'is_safe': result}
            if not result:
                response = 'attribute violation'
                response_status = status.HTTP_403_FORBIDDEN

        except Level.DoesNotExist:
            response = 'query level does not exist'
            response_status = status.HTTP_404_NOT_FOUND

        return Response(response, status=response_status)

    def delete(self, request):
        level_ids = request.data.get('id_set', ())
        response = {}
        response_status = status.HTTP_200_OK

        for level_id in level_ids:
            try:
                result = perform_level_delete(Level.objects.get(id=level_id))
                response[level_id] = result or 'attribute violation'
                if not result: response_status = status.HTTP_206_PARTIAL_CONTENT

            except Level.DoesNotExist:
                response[level_id] = 'query level does not exist'
                response_status = status.HTTP_206_PARTIAL_CONTENT

        return Response(response, status=response_status)


class AttributesViewSet(APIView):
    http_method_names = ('get', 'delete')
    permission_classes = (IsAuthenticated, AttributePermission)

    def get(self, _, attributeID):
        response = None
        response_status = status.HTTP_200_OK

        try:
            result = check_attribute_delete(Attribute.objects.get(id=attributeID))
            response = {'is_safe': result}
            if not result:
                response = 'attribute violation'
                response_status = status.HTTP_403_FORBIDDEN

        except Attribute.DoesNotExist:
            response = 'query attribute does not exist'
            response_status = status.HTTP_404_NOT_FOUND

        return Response(response, status=response_status)

    def delete(self, request):
        attribute_ids = request.data.get('id_set', ())
        response = {}
        response_status = status.HTTP_200_OK

        for attribute_id in attribute_ids:
            try:
                result = perform_attribute_delete(Attribute.objects.get(id=attribute_id))
                response[attribute_id] = result or 'attribute violation'
                if not result: response_status = status.HTTP_206_PARTIAL_CONTENT

            except Attribute.DoesNotExist:
                response[attribute_id] = 'query attribute does not exist'
                response_status = status.HTTP_206_PARTIAL_CONTENT

        return Response(response, status=response_status)
