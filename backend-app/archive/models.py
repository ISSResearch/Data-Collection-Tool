from django.db.models import (
    Model,
    CharField,
    ForeignKey,
    ManyToManyField,
    DO_NOTHING,
    DateTimeField,
)


class Archive(Model):
    STATUSES: tuple = (
        ("s", "SUCCESS"),
        ("f", "FAILURE"),
        ("p", "PENGING"),
    )

    id = CharField(max_length=24, primary_key=True, unique=True)
    result_id = CharField(max_length=24, unique=True)
    status = CharField(max_length=1, choices=STATUSES, default="p")
    create_date = DateTimeField(auto_now_add=True)

    project = ForeignKey("project.Project", on_delete=DO_NOTHING)
    author = ForeignKey("user.CustomUser", on_delete=DO_NOTHING)
    file = ManyToManyField("file.File")

    class Meta:
        db_table = "archive"
