from django.db import models


class File(models.Model):
    STATUSES = (('d', 'declined'), ('a', 'accepted'), ('v', 'validation'))

    path = models.FileField(max_length=350, upload_to='')
    hash_name = models.TextField()
    file_name = models.CharField(max_length=255)
    file_extension = models.CharField(max_length=55, default='')
    file_type = models.CharField(max_length=10)
    status = models.CharField(max_length=1, choices=STATUSES, default='v')
    upload_date = models.DateTimeField(auto_now_add=True)

    project = models.ForeignKey('project.Project', on_delete=models.DO_NOTHING)
    author = models.ForeignKey('user.CustomUser', on_delete=models.DO_NOTHING)

    class Meta: db_table = 'file'

    def __str__(self): return self.file_name
