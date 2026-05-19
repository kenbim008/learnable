import logging

import stripe
from django.conf import settings
from django.db import transaction

from .models import UserBillingProfile

logger = logging.getLogger(__name__)


def stripe_is_configured() -> bool:
    return bool(getattr(settings, "STRIPE_SECRET_KEY", ""))


def get_or_create_stripe_customer_id(user) -> str | None:
    """
    Return this user's Stripe Customer id, creating one in Stripe and persisting it if missing.

    Call this before Checkout Session / PaymentIntent creation so you can pass customer=cus_…
    Reuses the same customer for repeat purchases on your marketplace.

    Returns None if STRIPE_SECRET_KEY is not set (local dev without Stripe).
    """
    if not stripe_is_configured():
        logger.warning("STRIPE_SECRET_KEY is empty; not creating a Stripe customer.")
        return None

    stripe.api_key = settings.STRIPE_SECRET_KEY

    email = (getattr(user, "email", None) or "").strip() or None
    if not email and getattr(user, "username", None):
        email = user.username.strip() if "@" in user.username else None

    name = (user.get_full_name() or "").strip() or None

    with transaction.atomic():
        profile, _ = UserBillingProfile.objects.select_for_update().get_or_create(user=user)
        if profile.stripe_customer_id:
            return profile.stripe_customer_id

        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={"django_user_id": str(user.pk)},
        )
        profile.stripe_customer_id = customer.id
        profile.save(update_fields=["stripe_customer_id", "updated_at"])
        return customer.id
