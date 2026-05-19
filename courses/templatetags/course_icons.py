from __future__ import annotations

import re
from functools import lru_cache
from pathlib import Path

from django import template
from django.conf import settings
from django.utils.safestring import mark_safe

register = template.Library()

_ICON_DIR = Path(settings.BASE_DIR) / "static" / "svg" / "course-icons"


@lru_cache(maxsize=32)
def _svg_markup(icon_key: str) -> str:
    path = _ICON_DIR / f"{icon_key}.svg"
    if not path.is_file():
        path = _ICON_DIR / "book_open.svg"
    return path.read_text(encoding="utf-8").strip()


@register.simple_tag
def course_icon(icon_key: str, extra_class: str = "") -> str:
    """
    Inline an SVG from static/svg/course-icons/<icon_key>.svg.

    Usage (add your own colour/size classes on the root SVG):
      {% course_icon course.icon_key "course-card__glyph text-violet-600" %}

    Root element gets class ``svg-icon`` plus ``extra_class``. Paths use fill="currentColor",
    so set ``color`` on a parent or use utility classes that set ``color``.
    """
    from courses.models import Course

    valid = {c.value for c in Course.IconKey}
    if icon_key not in valid:
        icon_key = Course.IconKey.BOOK_OPEN.value
    svg = _svg_markup(icon_key)
    parts = ("svg-icon", extra_class.strip()) if extra_class.strip() else ("svg-icon",)
    combined = " ".join(p for p in parts if p)
    if not svg.lower().startswith("<svg"):
        return ""
    out, n = re.subn(r"<svg\b", f'<svg class="{combined}"', svg, count=1, flags=re.IGNORECASE)
    if n != 1:
        return mark_safe(svg)
    return mark_safe(out)
