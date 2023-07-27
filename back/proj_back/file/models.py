from django.db import models


class File(models.Model):
    STATUSES = (('d', 'declined'), ('a', 'accepted'))

    hash_name = models.TextField()
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10)
    path = models.FileField(upload_to='')
    status = models.CharField(max_length=1, choices=STATUSES, blank=True)
    upload_date = models.DateTimeField(auto_now_add=True)

    project = models.ForeignKey('project.Project', on_delete=models.DO_NOTHING)
    author = models.ForeignKey('user.CustomUser', on_delete=models.DO_NOTHING)

    class Meta: db_table = 'file'

    def __str__(self): return self.file_name
