import logging

from django.urls import reverse

from .models import Referral, ReferralCode

logger = logging.getLogger(__name__)

SESSION_KEY = "referral_code"


def get_or_create_referral_code(user) -> ReferralCode:
    """Return the user's persistent referral code, creating it on first access."""
    referral_code, _ = ReferralCode.objects.get_or_create(user=user)
    return referral_code


def referral_link(user, request) -> str:
    """Absolute signup URL carrying this user's referral code, e.g. /accounts/signup/?ref=CODE."""
    code = get_or_create_referral_code(user).code
    return request.build_absolute_uri(f"{reverse('accounts:signup')}?ref={code}")


def remember_referral(request) -> None:
    """Stash a ?ref= code from the current request in the session so it survives signup."""
    code = request.GET.get("ref")
    if code:
        request.session[SESSION_KEY] = code


def attach_referral(request, new_user) -> Referral | None:
    """
    Create a Referral for ``new_user`` from a previously remembered code, if any.

    Ignores unknown codes and self-referrals. Clears the session key either way.
    """
    code = request.session.pop(SESSION_KEY, None)
    if not code:
        return None

    referral_code = ReferralCode.objects.filter(code=code).select_related("user").first()
    if referral_code is None:
        logger.info("Signup used unknown referral code %r; ignoring.", code)
        return None

    if referral_code.user_id == new_user.pk:
        return None

    return Referral.objects.create(
        referrer=referral_code.user,
        referred_user=new_user,
        code=code,
    )
