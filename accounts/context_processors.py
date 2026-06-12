from django.urls import reverse

from accounts.navigation import dashboard_url_name, nav_home_for_user


def navigation(request):
    """
    Global nav: logo target (dashboard when applicable), catalog link, flags for header layout.
    """
    landing = reverse("courses:landing")
    catalog = f"{landing}#courses"
    user = request.user

    if not user.is_authenticated:
        return {
            "nav_home": {"url": landing, "label": "Home"},
            "nav_landing_url": landing,
            "nav_catalog_url": catalog,
            "nav_show_public_home_link": True,
        }

    if dashboard_url_name(user):
        return {
            "nav_home": nav_home_for_user(user),
            "nav_landing_url": landing,
            "nav_settings_url": reverse("accounts:settings"),
            "nav_catalog_url": catalog,
            "nav_show_public_home_link": True,
        }

    return {
        "nav_home": {"url": landing, "label": "Home"},
        "nav_landing_url": landing,
        "nav_catalog_url": catalog,
        "nav_show_public_home_link": True,
    }
