"""Role-aware URLs for templates and redirects."""

from __future__ import annotations

from django.contrib.auth.models import User
from django.urls import reverse

from accounts.constants import GROUP_ADMIN, GROUP_INSTRUCTOR, GROUP_STUDENT
from accounts.forms import user_in_group


def dashboard_url_name(user: User) -> str | None:
    """Named URL for the user's main portal, or None if they only have the public catalog."""
    if user.is_superuser:
        return "courses:dashboard_superadmin"
    if user.is_staff and user_in_group(user, GROUP_ADMIN):
        return "courses:dashboard_admin"
    if user_in_group(user, GROUP_INSTRUCTOR):
        return "courses:dashboard_instructor"
    if user_in_group(user, GROUP_STUDENT):
        return "courses:dashboard_student"
    return None


def nav_home_for_user(user: User) -> dict[str, str]:
    """
    Where the product "home" / logo should go: dashboard when available, else marketing home.
    """
    name = dashboard_url_name(user)
    if name:
        return {"url": reverse(name), "label": "Dashboard"}
    return {"url": reverse("courses:landing"), "label": "Home"}
