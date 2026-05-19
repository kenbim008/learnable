from django.apps import AppConfig


def _ensure_groups(**kwargs):
    """
    Create the LEARNible permission groups if missing (Students, Instructors, Admins, Super Admins).

    Signup and dashboards assign users to these groups. They must exist before assign_role_groups()
    runs, but we cannot create them in AppConfig.ready()—that runs during startup before migrations
    may have created auth_group. post_migrate runs after migrations, so the table is guaranteed.
    """
    from django.contrib.auth.models import Group

    from .constants import ALL_GROUPS

    for name in ALL_GROUPS:
        Group.objects.get_or_create(name=name)


class AccountsConfig(AppConfig):
    """Django app config for public auth views (login/signup) and group bootstrap."""

    default_auto_field = "django.db.models.BigAutoField"
    name = "accounts"
    verbose_name = "Accounts"

    def ready(self):
        # One-shot hook after this app's migrations (and shared auth migrations) have applied.
        from django.db.models.signals import post_migrate

        post_migrate.connect(_ensure_groups, sender=self)
