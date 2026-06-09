import secrets

from django.conf import settings
from django.db import models


def generate_referral_code() -> str:
    """Short, URL-safe, hard-to-guess code used in instructor referral links."""
    return secrets.token_urlsafe(8)


class UserBillingProfile(models.Model):
    """
    One row per user: stable Stripe Customer for Checkout, invoices, and saved payment methods.
    Instructor Connect account ids belong elsewhere when you add marketplace payouts.
    """

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="billing_profile",
    )
    stripe_customer_id = models.CharField(
        max_length=255,
        blank=True,
        db_index=True,
        help_text="Stripe Customer id (cus_…); set when first needed via get_or_create_stripe_customer_id().",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "User billing profile"
        verbose_name_plural = "User billing profiles"

    def __str__(self) -> str:
        return f"{self.user_id} billing ({self.stripe_customer_id or 'no Stripe customer yet'})"


class ReferralCode(models.Model):
    """One persistent referral code per user (used by instructors to invite signups)."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="referral_code",
    )
    code = models.CharField(
        max_length=32,
        unique=True,
        db_index=True,
        default=generate_referral_code,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.user_id} → {self.code}"


class Referral(models.Model):
    """Records that ``referred_user`` signed up via ``referrer``'s referral link."""

    referrer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="referrals_made",
    )
    referred_user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="referred_by",
    )
    code = models.CharField(max_length=32, help_text="The referral code used at signup.")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.referred_user_id} referred by {self.referrer_id}"


class ReferralEarning(models.Model):
    """
    Records earnings from successful referrals.
    $25 awarded when referred user becomes an instructor or enrolls in a paid course.
    """

    referrer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="referral_earnings",
    )
    referral = models.OneToOneField(
        Referral,
        on_delete=models.CASCADE,
        related_name="earning",
    )
    REASON_INSTRUCTOR = "instructor_signup"
    REASON_PAID_COURSE = "paid_course_enrollment"
    REASON_CHOICES = [
        (REASON_INSTRUCTOR, "Referred user became an instructor"),
        (REASON_PAID_COURSE, "Referred user enrolled in paid course"),
    ]
    reason = models.CharField(max_length=32, choices=REASON_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2, default="25.00")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"${self.amount} from {self.referral_id} ({self.reason})"
