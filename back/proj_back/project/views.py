from rest_framework.views import Response, APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .permissions import ProjectPermission, ProjectViewPermission
from .serializers import ProjectsSerializer, ProjectSerializer, Project
from .services import update_project


class ProjectsViewSet(APIView):
    http_method_names = ('post', 'get')
    permission_classes = (IsAuthenticated, ProjectPermission)

    def get(self, request):
        projects = Project.objects.order_by('id').filter(visible=True)

        if not request.user.is_superuser:
            projects = projects.filter(user_visible__id=13)

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

        return Response(response_data, status=response_status)


class ProjectViewSet(APIView):
    http_method_names = ('get', 'patch', 'delete')
    permission_classes = (IsAuthenticated, ProjectPermission, ProjectViewPermission)

    def get(self, _, pk):
        response = None
        response_status = status.HTTP_200_OK

        try:
            project = Project.objects.filter(visible=True).get(id=pk)
            response = ProjectSerializer(project).data

        except Project.DoesNotExist:
            response = 'query project does not exist'
            response_status = status.HTTP_404_NOT_FOUND

        return Response(response, status=response_status)

    def patch(self, request, pk):
        succeed, errors = update_project(request, pk)

        response_data = {'ok': succeed}
        if errors: response_data['errors'] = errors

        response_status = (
            status.HTTP_202_ACCEPTED if succeed
            else status.HTTP_400_BAD_REQUEST
        )

        return Response(response_data, status=response_status)

    def delete(self, request, pk):
        response = None
        response_status = status.HTTP_200_OK

        try:
            project = Project.objects.filter(visible=True).get(id=pk)

            if request.data.get('approval') != project.name:
                response = 'approval text differs from the actual name'
                response_status = status.HTTP_400_BAD_REQUEST
            else:
                project.visible = False
                project.reason_if_hidden = 'd'
                project.save()
                response = {'deleted': True}

        except Project.DoesNotExist:
            response = 'query project does not exist'
            response_status = status.HTTP_404_NOT_FOUND

        return Response(response, status=response_status)
# TODO: changed - revise tests