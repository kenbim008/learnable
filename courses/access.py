import re
from django.contrib.auth import get_user_model

from accounts.constants import GROUP_ADMIN
from accounts.forms import user_in_group
from .models import Course, Enrollment

User = get_user_model()

_COURSE_ASSET = re.compile(
    r"^(?P<prefix>videos|images|documents)/courses/(?P<course_id>\d+)/(?P<rest>.+)$"
)


def normalize_storage_key(key: str) -> str | None:
    if not key:
        return None
    k = key.strip().lstrip("/")
    if ".." in k or k.startswith("/"):
        return None
    return k


def can_serve_knowledge(user: User, storage_key: str) -> bool:
    """
    Rules:
    - Any key under videos/ requires an authenticated user (including previews).
    - Course previews: videos/courses/<id>/preview/... — authenticated, no purchase required.
    - Paid course assets: videos/courses/<id>/content/..., images/courses/<id>/..., documents/courses/<id>/...
      require enrollment, owning instructor, or staff (admin/super).
    """
    key = normalize_storage_key(storage_key)
    if not key:
        return False

    if key.startswith("videos/"):
        if not user.is_authenticated:
            return False

    m = _COURSE_ASSET.match(key)
    if not m:
        # Unknown layout: deny by default for safety
        return False

    course_id = int(m.group("course_id"))
    rest = m.group("rest")
    prefix = m.group("prefix")

    try:
        course = Course.objects.get(pk=course_id)
    except Course.DoesNotExist:
        return False

    if user.is_superuser:
        return True
    if user.is_staff and user_in_group(user, GROUP_ADMIN):
        return True
    if user.is_authenticated and course.instructor_id == user.id:
        return True

    is_preview_video = prefix == "videos" and rest.startswith("preview/")
    if is_preview_video:
        return user.is_authenticated

    is_paid_area = (prefix == "videos" and rest.startswith("content/")) or prefix in ("images", "documents")
    if not is_paid_area:
        return False

    if not user.is_authenticated:
        return False
    return Enrollment.objects.filter(user=user, course=course).exists()


def can_view_course_lessons(user: User, course: Course) -> bool:
    """Full lesson video and paid assets (not preview-only)."""
    if not user.is_authenticated:
        return False
    if user.is_superuser:
        return True
    if user.is_staff and user_in_group(user, GROUP_ADMIN):
        return True
    if course.instructor_id == user.id:
        return True
    return Enrollment.objects.filter(user=user, course=course).exists()
