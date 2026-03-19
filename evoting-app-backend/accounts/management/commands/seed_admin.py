from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Create the default super admin account"

    def handle(self, *args, **options):
        if User.objects.filter(username="admin").exists():
            self.stdout.write(self.style.WARNING("Default admin already exists."))
            return

        User.objects.create_superuser(
            username="admin",
            email="admin@evote.com",
            password="admin123",
            first_name="System",
            last_name="Administrator",
            role=User.Role.SUPER_ADMIN,
            is_verified=True,
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Default super admin created: username='admin', password='admin123'"
            )
        )
