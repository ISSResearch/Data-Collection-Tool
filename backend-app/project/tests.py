from .project_tests.models_test import ProjectModelTest
from .project_tests.serializers_test import ProjectSerializerTest, ProjectsSerializerTest
from .project_tests.services_test import ProjectUpdateService
from .project_tests.permissions_test import (
    ProjectsPermissionTest,
    ProjectPermissionTest,
    ProjectViewPermissionTest,
    ProjectStatsPermissionTest,
)
from .project_tests.views_test import (
    ProjectsViewSetTest,
    ProjectViewSetTest,
    CollectorViewTest
)
