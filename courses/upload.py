from __future__ import annotations

import mimetypes
import re
import secrets
from pathlib import Path

from django.conf import settings

from .models import Course, CourseModule
from .s3 import s3_client


class CourseUploadError(Exception):
    """User-facing upload validation or storage failure."""


_VIDEO_EXT = frozenset({".mp4", ".webm", ".mov", ".m4v"})
_IMAGE_EXT = frozenset({".jpg", ".jpeg", ".png", ".webp", ".gif"})


def _extension(name: str) -> str:
    return Path(name).suffix.lower()


def _safe_stem(name: str) -> str:
    stem = Path(name).stem
    stem = re.sub(r"[^\w\-]+", "_", stem, flags=re.UNICODE).strip("._-") or "file"
    return stem[:72]


def _unique_filename(original_name: str, allowed: frozenset[str]) -> str:
    ext = _extension(original_name)
    if ext not in allowed:
        allowed_human = ", ".join(sorted(allowed))
        raise CourseUploadError(f"Unsupported file type “{ext}”. Allowed: {allowed_human}.")
    stem = _safe_stem(original_name)
    token = secrets.token_hex(4)
    return f"{stem}_{token}{ext}"


def _guess_content_type(filename: str) -> str | None:
    guessed, _ = mimetypes.guess_type(filename)
    return guessed


def _put_object(*, key: str, body: bytes, content_type: str | None) -> None:
    client = s3_client()
    extra: dict = {"Bucket": settings.AWS_STORAGE_BUCKET_NAME, "Key": key, "Body": body}
    if content_type:
        extra["ContentType"] = content_type
    client.put_object(**extra)


def _read_and_validate_size(uploaded, max_bytes: int) -> bytes:
    if uploaded.size > max_bytes:
        mb = max_bytes // (1024 * 1024)
        raise CourseUploadError(f"That file is too large (maximum {mb} MB).")
    data = uploaded.read()
    uploaded.seek(0)
    if len(data) > max_bytes:
        raise CourseUploadError("That file is too large.")
    return data


def apply_course_media_uploads(course: Course, *, preview=None, primary=None, cover=None) -> None:
    """
    Upload optional instructor files to the knowledge_items bucket at the canonical paths.
    Updates preview_basename / primary_video_basename / cover_basename on ``course``.
    """
    updates: list[str] = []

    if preview is not None:
        name = _unique_filename(preview.name, _VIDEO_EXT)
        key = f"videos/courses/{course.pk}/preview/{name}"
        body = _read_and_validate_size(preview, settings.COURSE_UPLOAD_MAX_VIDEO_BYTES)
        _put_object(key=key, body=body, content_type=_guess_content_type(name) or "video/mp4")
        course.preview_basename = name
        updates.append("preview_basename")

    if primary is not None:
        name = _unique_filename(primary.name, _VIDEO_EXT)
        key = f"videos/courses/{course.pk}/content/{name}"
        body = _read_and_validate_size(primary, settings.COURSE_UPLOAD_MAX_VIDEO_BYTES)
        _put_object(key=key, body=body, content_type=_guess_content_type(name) or "video/mp4")
        course.primary_video_basename = name
        updates.append("primary_video_basename")

    if cover is not None:
        name = _unique_filename(cover.name, _IMAGE_EXT)
        key = f"images/courses/{course.pk}/{name}"
        body = _read_and_validate_size(cover, settings.COURSE_UPLOAD_MAX_IMAGE_BYTES)
        _put_object(key=key, body=body, content_type=_guess_content_type(name) or "image/jpeg")
        course.cover_basename = name
        updates.append("cover_basename")

    if updates:
        course.save(update_fields=updates)


def apply_module_video_upload(module: CourseModule, uploaded) -> None:
    if uploaded is None:
        return
    name = _unique_filename(uploaded.name, _VIDEO_EXT)
    key = f"videos/courses/{module.course_id}/modules/{module.pk}/{name}"
    body = _read_and_validate_size(uploaded, settings.COURSE_UPLOAD_MAX_VIDEO_BYTES)
    _put_object(key=key, body=body, content_type=_guess_content_type(name) or "video/mp4")
    module.video_basename = name
    module.save(update_fields=["video_basename"])
