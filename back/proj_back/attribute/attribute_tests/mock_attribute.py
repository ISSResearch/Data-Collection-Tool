from project.models import Project
from file.models import File
from attribute.models import Attribute, Level, AttributeGroup
from user.models import CustomUser
from random import random


class MockCase:
    def __init__(self):
        random_add = str(int(random() * 1000))
        self.user = CustomUser.objects.create(
            username='u_name' + random_add,
            password='123'
        )
        self.project = Project.objects.create(name='p_name' + random_add)
        self.file_ = File.objects.create(
            file_name='f_name',
            project=self.project,
            author_id=self.user.id
        )
        self.level = Level.objects.create(
            uid=int(random() * 1_000_000_000),
            name='l_name',
            project=self.project
        )
        self.attribute = Attribute.objects.create(
            name='parent_atr',
            project=self.project,
            level=self.level
        )
        self.attributegroup = AttributeGroup.objects.create()
        self.attributegroup.file = self.file_
        self.attributegroup.attribute.set({self.attribute})
        self.attributegroup.save()


def case_set_up():
    case_legit = MockCase()
    case_unassigned = MockCase()

    case_unassigned.attributegroup.attribute.clear()
    case_unassigned.attributegroup.file = None
    case_unassigned.attributegroup.save()

    return case_legit, case_unassigned