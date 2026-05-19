from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Course(models.Model):
    class IconKey(models.TextChoices):
        HAT = "hat", "Graduation cap"
        CHART = "chart", "Chart"
        AT_SIGN = "at_sign", "At symbol"
        BEAKER = "beaker", "Beaker"
        BOOK_OPEN = "book_open", "Open book"
        BRIEFCASE = "briefcase", "Briefcase"
        CALCULATOR = "calculator", "Calculator"

    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, max_length=200)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="courses_teaching")
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.8)
    icon_key = models.CharField(
        "Course icon",
        max_length=32,
        choices=IconKey.choices,
        default=IconKey.BOOK_OPEN,
        help_text="Small picture next to your course name in lists.",
    )
    preview_basename = models.CharField(
        "Preview video (optional)",
        max_length=255,
        blank=True,
        help_text="Filled in when you add a preview clip.",
    )
    primary_video_basename = models.CharField(
        "Main video (optional)",
        max_length=255,
        blank=True,
        help_text="Filled in when you add a lesson video.",
    )
    cover_basename = models.CharField(
        "Cover image (optional)",
        max_length=255,
        blank=True,
        help_text="Filled in when you add a cover image.",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.title

    @property
    def preview_storage_key(self) -> str:
        if not self.preview_basename:
            return ""
        return f"videos/courses/{self.pk}/preview/{self.preview_basename}"

    @property
    def primary_video_storage_key(self) -> str:
        if not self.primary_video_basename:
            return ""
        return f"videos/courses/{self.pk}/content/{self.primary_video_basename}"

    @property
    def cover_storage_key(self) -> str:
        if not self.cover_basename:
            return ""
        return f"images/courses/{self.pk}/{self.cover_basename}"


class Enrollment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="enrollments")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="enrollments")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "course"], name="unique_enrollment_per_user_course"),
        ]

    def __str__(self) -> str:
        return f"{self.user_id} → {self.course_id}"
