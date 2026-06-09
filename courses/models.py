from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

PLATFORM_PAYOUT_RATE = Decimal("0.50")
PAYOUT_MINIMUM = Decimal("50.00")


class StripeProduct(models.Model):
    """
    Stores Stripe Product + Price IDs for platform billing plans.
    stripe_price_id is populated lazily on first use via the Stripe API.
    """

    key = models.CharField(max_length=100, unique=True, help_text="Internal identifier, e.g. 'instructor_plan'.")
    name = models.CharField(max_length=255)
    stripe_product_id = models.CharField(max_length=255, unique=True)
    stripe_price_id = models.CharField(
        max_length=255,
        blank=True,
        help_text="Populated automatically from Stripe on first checkout. You can also set it manually.",
    )
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.name} ({self.key})"


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
    paid = models.BooleanField(default=False)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "course"], name="unique_enrollment_per_user_course"),
        ]

    def __str__(self) -> str:
        return f"{self.user_id} → {self.course_id}"


class InstructorSubscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="instructor_subscription")
    stripe_subscription_id = models.CharField(max_length=255, unique=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(max_length=50)
    current_period_end = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_active(self) -> bool:
        return self.status in ("active", "trialing")

    def __str__(self) -> str:
        return f"{self.user_id} subscription ({self.status})"


class PayoutRequest(models.Model):
    STATUS_PENDING = "pending"
    STATUS_PAID = "paid"
    STATUS_REJECTED = "rejected"

    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="payout_requests")
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, default=STATUS_PENDING)
    requested_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Payout ${self.amount} for {self.instructor_id} ({self.status})"


class InstructorEarning(models.Model):
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="earnings")
    enrollment = models.OneToOneField(Enrollment, on_delete=models.CASCADE, related_name="earning")
    gross_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payout_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payout_request = models.ForeignKey(
        PayoutRequest, null=True, blank=True, on_delete=models.SET_NULL, related_name="earnings"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"Earning ${self.payout_amount} for instructor {self.instructor_id}"
