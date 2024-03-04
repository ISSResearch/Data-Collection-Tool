# flake8: noqa
from file.file_tests.models_test import FileModelTest
from file.file_tests.permissions_test import FilePermissionTest
from file.file_tests.serializers_test import FileSerializerTest, FilesSerializerTest
from file.file_tests.services_test import (
    ViewServicesTest,
    AnnotationTest,
    StatsServiceTest,
    # TODO: rewrote uploader - rewrite test
    # FileUploaderTest,
)
from file.file_tests.views_test import (
    FileViewSetTest,
    FilesViewSetTest,
    StatsViewTest,
    AnnotationViewTest
)
# flake8: noqa
