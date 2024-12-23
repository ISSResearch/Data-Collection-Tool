from django.db.models import (
    Model,
    CharField,
    ForeignKey,
    ManyToManyField,
    DO_NOTHING,
    DateTimeField,
    IntegerField,
    JSONField,
    TextField
)


class Archive(Model):
    STATUSES = (("s", "SUCCESS"), ("f", "FAILURE"), ("p", "PENDING"),)

    id = CharField(max_length=36, primary_key=True)
    result_id = CharField(max_length=24, null=True)
    result_size = IntegerField(null=True)
    result_message = TextField(null=True)
    status = CharField(max_length=1, choices=STATUSES, default="p")
    filters = JSONField()
    create_date = DateTimeField(auto_now_add=True)

    project = ForeignKey("project.Project", on_delete=DO_NOTHING)
    author = ForeignKey("user.CustomUser", on_delete=DO_NOTHING)
    file = ManyToManyField("file.File")

    class Meta:
        db_table = "archive"
