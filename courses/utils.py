from __future__ import annotations

from django.utils.text import slugify

from .models import Course


def assign_unique_slug_from_title(course: Course) -> None:
    """Set ``course.slug`` from ``course.title``, appending -2, -3, … until unique."""
    base = slugify(course.title) or "course"
    slug = base
    n = 2
    qs = Course.objects.all()
    if course.pk:
        qs = qs.exclude(pk=course.pk)
    while qs.filter(slug=slug).exists():
        slug = f"{base}-{n}"
        n += 1
    course.slug = slug
