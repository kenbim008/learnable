import logging

import stripe
from django.conf import settings
from django.urls import reverse

from accounts.stripe_customer import get_or_create_stripe_customer_id

logger = logging.getLogger(__name__)


def get_price_id_for_product(key: str) -> str:
    """
    Return the Stripe Price ID for the given product key.
    If stripe_price_id is blank, fetches the first active price from Stripe and caches it.
    """
    from .models import StripeProduct

    product = StripeProduct.objects.get(key=key, active=True)

    if product.stripe_price_id:
        return product.stripe_price_id

    stripe.api_key = settings.STRIPE_SECRET_KEY
    prices = stripe.Price.list(product=product.stripe_product_id, active=True, limit=1)
    if not prices.data:
        raise ValueError(f"No active Stripe prices found for product {product.stripe_product_id}")

    product.stripe_price_id = prices.data[0].id
    product.save(update_fields=["stripe_price_id", "updated_at"])
    logger.info("Cached Stripe price %s for product key '%s'", product.stripe_price_id, key)
    return product.stripe_price_id


def create_course_checkout_session(user, course, request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    customer_id = get_or_create_stripe_customer_id(user)

    success_url = (
        request.build_absolute_uri(reverse("courses:checkout_success"))
        + "?session_id={CHECKOUT_SESSION_ID}"
    )
    cancel_url = request.build_absolute_uri(
        reverse("courses:checkout_cancel") + f"?course={course.slug}"
    )

    params = dict(
        payment_method_types=["card"],
        line_items=[
            {
                "price_data": {
                    "currency": "usd",
                    "unit_amount": int(course.price * 100),
                    "product_data": {"name": course.title},
                },
                "quantity": 1,
            }
        ],
        mode="payment",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "type": "course_purchase",
            "course_id": str(course.pk),
            "user_id": str(user.pk),
        },
    )
    if customer_id:
        params["customer"] = customer_id

    return stripe.checkout.Session.create(**params)


def create_instructor_subscription_session(user, request):
    stripe.api_key = settings.STRIPE_SECRET_KEY
    customer_id = get_or_create_stripe_customer_id(user)

    success_url = (
        request.build_absolute_uri(reverse("courses:checkout_success"))
        + "?session_id={CHECKOUT_SESSION_ID}"
    )
    cancel_url = request.build_absolute_uri(reverse("courses:dashboard_instructor"))

    price_id = get_price_id_for_product("instructor_plan")

    params = dict(
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "type": "instructor_subscription",
            "user_id": str(user.pk),
        },
    )
    if customer_id:
        params["customer"] = customer_id

    return stripe.checkout.Session.create(**params)
