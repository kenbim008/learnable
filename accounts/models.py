from django.conf import settings
from django.db import models


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
