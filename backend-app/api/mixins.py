from django.db.models import Model
from typing import Any, Callable
from rest_framework.status import HTTP_404_NOT_FOUND


def with_model_assertion(
    model: Model,
    accessor: str,
    class_based=True,
    **kw
) -> Callable:
    def decorator(callback: Callable) -> Callable:
        def inner(*args, **kwargs) -> Any:
            pk_index = int(class_based)

            try:
                _model = model.objects \
                    .select_related(*kw.get("select", [])) \
                    .prefetch_related(*kw.get("prefetch", [])) \
                    .filter(**kw.get("filter", {})) \
                    .get(**{accessor: args[pk_index]})

                arg_payload = list(args)
                arg_payload[pk_index] = _model

                return callback(*arg_payload, **kwargs)

            except model.DoesNotExist: return (
                {"message": "Query model does not exist"},
                HTTP_404_NOT_FOUND
            )

        return inner

    return decorator
