from django.core.management.base import BaseCommand
from django.db import transaction
from user.models import CustomUser


class Command(BaseCommand):
    def handle(self, *args, **options):
        with transaction.atomic():
            print("removing user tokens...")
            removed: int = CustomUser.objects.update(token=None)
            print(f"removed {removed} token")
