from .serializers import ProjectSerializer, Project


def update_project(request, id):
    project = Project.objects.prefetch_related('attribute_set').get(id=id)

    new_data = ProjectSerializer(project, data=request.data, partial=True)

    new_data_valid = new_data.is_valid()

    if new_data_valid:
        new_data.save()
        new_data.add_attributes()

    return (
        new_data_valid,
        new_data.errors if not new_data_valid else None
    )
