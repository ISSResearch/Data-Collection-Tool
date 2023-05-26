from rest_framework.views import Response, APIView
from rest_framework import status
from .serializers import Level, Attribute
from .services import perform_attribute_delete, perform_level_delete

class LevelViewSet(APIView):
    http_method_names = ['delete']

    def delete(self, _, levelID):
        response = None
        response_status = status.HTTP_200_OK

        try:
          result = perform_level_delete(Level.objects.get(id=levelID))
          response = {'delete': result}

        except Level.DoesNotExist:
            response = 'query level does not exist'
            response_status = status.HTTP_404_NOT_FOUND

        return Response(response, status=response_status)


class AttributeViewSet(APIView):
    http_method_names = ['delete']

    def delete(self, _, attributeID):
        response = None
        response_status = status.HTTP_200_OK

        try:
          result = perform_attribute_delete(Attribute.objects.get(id=attributeID))
          response = {'delete': result}

        except Attribute.DoesNotExist:
            response = 'query level does not exist'
            response_status = status.HTTP_404_NOT_FOUND

        return Response(response, status=response_status)
