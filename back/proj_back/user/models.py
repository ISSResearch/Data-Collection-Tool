from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    ROLES = (
        ('a', 'admin'),
        ('c', 'collector'),
    )
    user_role = models.CharField(max_length=1, choices=ROLES)

    class Meta:
      db_table = 'user'
      verbose_name = 'User'
      verbose_name_plural = 'Users'

    def __str__(self): return self.username
