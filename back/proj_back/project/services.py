from .serializers import ProjectSerializer, Project

# todo: apparently not tested
def update_project(request, id):
    project = Project.objects.prefetch_related('attribute_set').get(id=id)

    updated_project = ProjectSerializer(project, data=request.data)

    new_data_valid = updated_project.is_valid()

    if new_data_valid: updated_project.save()

    return (
        new_data_valid,
        new_data_valid.errors if not new_data_valid else None
    )
