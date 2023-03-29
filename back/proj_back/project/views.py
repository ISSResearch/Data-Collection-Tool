from rest_framework.views import Response, APIView
from rest_framework import status
from .serializers import ProjectsSerializer, ProjectSerializer, Project


class ProjectsViewSet(APIView):
    http_method_names = ['post', 'get']

    def get(self, _):
        projects = Project.objects.all()
        response = ProjectsSerializer(projects, many=True)
        return Response(response.data)

    def post(self, request):
        new_project = ProjectsSerializer(data=request.data)

        new_project_valid = new_project.is_valid()
        if new_project_valid:
            new_project.save()
            new_project.add_attributes()

        response_data = {'ok': new_project_valid}
        response_status = status.HTTP_201_CREATED
        if not new_project_valid:
            response_data['errors'] = new_project.errors
            response_status = status.HTTP_400_BAD_REQUEST

        return  Response(response_data, status=response_status)


class ProjectViewSet(APIView):
    http_method_names = ['get', 'put', 'patch']

    def get(self, request, pk):
        project = Project.objects.prefetch_related('attribute_set').get(id=pk)
        response = ProjectSerializer(project)
        return Response(response.data)

    def put(self, request, pk):
        response_data, response_status = self.update_project(request, pk)
        return  Response(response_data, status=response_status)

    def patch(self, request, pk):
        response_data, response_status = self.update_project(request, pk)
        return  Response(response_data, status=response_status)

    def update_project(self, request, id):
        project = Project.objects.prefetch_related('attribute_set').get(id=id)
        updated_project = ProjectSerializer(project, data=request.data)

        new_data_valid = updated_project.is_valid()
        if new_data_valid: updated_project.save()

        response_data = {'ok': new_data_valid}
        response_status = status.HTTP_202_ACCEPTED

        if not new_data_valid:
            response_data['errors'] = new_data_valid.errors
            response_status = status.HTTP_400_BAD_REQUEST

        return response_data, response_status
