import datetime
import json
import logging
from decimal import Decimal

import stripe
from django.conf import settings
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Count, Q, Sum
from django.db.models.functions import ExtractMonth, ExtractYear

from accounts.models import ReferralEarning
from django.http import HttpResponse, HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from accounts.constants import GROUP_ADMIN, GROUP_INSTRUCTOR, GROUP_STUDENT
from accounts.forms import user_in_group
from accounts.stripe_customer import stripe_is_configured
from accounts.referrals import get_or_create_referral_code, referral_link

from .access import can_serve_knowledge, can_view_course_lessons, normalize_storage_key
from .categories import COURSE_CATEGORIES
from .models import (
    Course,
    CourseModule,
    Enrollment,
    InstructorEarning,
    InstructorSubscription,
    PLATFORM_PAYOUT_RATE,
    PAYOUT_MINIMUM,
    PayoutRequest,
)
from .s3 import presigned_get_url
from .upload import CourseUploadError, apply_course_media_uploads, apply_module_video_upload

User = get_user_model()
logger = logging.getLogger(__name__)

PAYOUT_ADMIN_EMAIL = "ingo.learnible@gmail.com"


def _course_form_context(form, formset, *, is_edit=False, course=None, back_url=None):
    return {
        "form": form,
        "formset": formset,
        "is_edit": is_edit,
        "course": course,
        "back_url": back_url or reverse("courses:dashboard_instructor"),
        "course_categories_json": json.dumps(
            {
                key: {"label": data["label"], "subcategories": data["subcategories"]}
                for key, data in COURSE_CATEGORIES.items()
            }
        ),
    }


def _save_course_with_modules(request, *, course=None, instructor=None):
    from .forms import CourseForm, CourseModuleFormSet

    is_edit = course is not None
    form = CourseForm(request.POST, request.FILES, instance=course)
    if not form.is_valid():
        return None, form, CourseModuleFormSet(request.POST, request.FILES, instance=course), "form"

    try:
        with transaction.atomic():
            saved = form.save(commit=False)
            if not is_edit:
                saved.instructor = instructor
                saved.status = Course.Status.PENDING_REVIEW
            saved.save()
            apply_course_media_uploads(
                saved,
                preview=form.cleaned_data.get("preview_video"),
                primary=form.cleaned_data.get("primary_video"),
                cover=form.cleaned_data.get("cover_image"),
            )
            formset = CourseModuleFormSet(request.POST, request.FILES, instance=saved)
            if not formset.is_valid():
                if not is_edit:
                    saved.delete()
                return None, form, formset, "formset"
            formset.save()
            for mod_form in formset.forms:
                if not mod_form.cleaned_data or mod_form.cleaned_data.get("DELETE"):
                    continue
                module = mod_form.instance
                if not module.pk:
                    continue
                video = mod_form.cleaned_data.get("video")
                if video:
                    apply_module_video_upload(module, video)
    except CourseUploadError as exc:
        return None, form, CourseModuleFormSet(request.POST, request.FILES, instance=course), str(exc)
    except Exception:
        logger.exception("Course save failed")
        return None, form, CourseModuleFormSet(request.POST, request.FILES, instance=course), "upload"

    return saved, form, None, None


def _instructor_plan_exists() -> bool:
    from .models import StripeProduct
    return StripeProduct.objects.filter(key="instructor_plan", active=True).exists()


def landing(request):
    courses = Course.objects.select_related("instructor").filter(status=Course.Status.PUBLISHED)
    enrolled_ids: set[int] = set()
    is_student = False
    is_instructor = False
    instructor_subscription = None
    if request.user.is_authenticated:
        is_student = user_in_group(request.user, GROUP_STUDENT)
        is_instructor = user_in_group(request.user, GROUP_INSTRUCTOR)
        enrolled_ids = set(
            Enrollment.objects.filter(user=request.user).values_list("course_id", flat=True)
        )
        if is_instructor:
            instructor_subscription = InstructorSubscription.objects.filter(
                user=request.user
            ).first()
    return render(
        request,
        "courses/landing.html",
        {
            "courses": courses,
            "enrolled_course_ids": enrolled_ids,
            "is_student": is_student,
            "is_instructor": is_instructor,
            "instructor_subscription": instructor_subscription,
            "show_marketing": True,
            "course_categories": COURSE_CATEGORIES,
            "stripe_configured": stripe_is_configured(),
            "instructor_price_configured": _instructor_plan_exists(),
        },
    )


def community(request):
    return render(request, "courses/community.html")


def _course_learn_back_url(user) -> str:
    if user_in_group(user, GROUP_STUDENT):
        return reverse("courses:dashboard_student")
    if user_in_group(user, GROUP_INSTRUCTOR):
        return reverse("courses:dashboard_instructor")
    return reverse("courses:landing")


@login_required
def course_learn(request, slug):
    course = get_object_or_404(
        Course.objects.select_related("instructor").prefetch_related("modules"),
        slug=slug,
    )
    is_enrolled = Enrollment.objects.filter(user=request.user, course=course).exists()
    is_instructor = course.instructor_id == request.user.id
    is_student = user_in_group(request.user, GROUP_STUDENT)
    is_admin = request.user.is_staff and user_in_group(request.user, GROUP_ADMIN)

    if not course.is_live and not (is_instructor or is_admin or request.user.is_superuser):
        messages.error(request, "This course is not available yet.")
        return redirect("courses:landing")

    can_watch_lesson = can_view_course_lessons(request.user, course)
    modules = list(course.modules.all())

    return render(
        request,
        "courses/course_learn.html",
        {
            "course": course,
            "modules": modules,
            "is_enrolled": is_enrolled,
            "is_instructor": is_instructor,
            "is_student": is_student,
            "can_watch_lesson": can_watch_lesson,
            "back_url": _course_learn_back_url(request.user),
        },
    )


def _guard_group(request, group_name: str, message: str):
    if not request.user.is_authenticated:
        return redirect(settings.LOGIN_URL)
    if not user_in_group(request.user, group_name):
        messages.error(request, message)
        return redirect("courses:landing")
    return None


@login_required
def dashboard(request):
    """Unified dashboard — shows student/instructor/admin/superadmin content based on role."""
    if request.user.is_superuser:
        return dashboard_superadmin(request)
    if request.user.is_staff and user_in_group(request.user, GROUP_ADMIN):
        return dashboard_admin(request)
    if user_in_group(request.user, GROUP_INSTRUCTOR):
        return dashboard_instructor(request)
    if user_in_group(request.user, GROUP_STUDENT):
        return dashboard_student(request)
    # Fallback: no role assigned
    messages.info(request, "Your account doesn't have a role yet. Contact your administrator.")
    return redirect("courses:landing")


def dashboard_student_redirect(request):
    """Redirect legacy /dashboard/student/ to /dashboard/"""
    return redirect("courses:dashboard")


def dashboard_instructor_redirect(request):
    """Redirect legacy /dashboard/instructor/ to /dashboard/"""
    return redirect("courses:dashboard")


def dashboard_admin_redirect(request):
    """Redirect legacy /dashboard/admin/ to /dashboard/"""
    return redirect("courses:dashboard")


def dashboard_superadmin_redirect(request):
    """Redirect legacy /dashboard/superadmin/ to /dashboard/"""
    return redirect("courses:dashboard")


def dashboard_student(request):
    redirect_response = _guard_group(
        request,
        GROUP_STUDENT,
        "The student portal is only available to accounts registered as students.",
    )
    if redirect_response:
        return redirect_response

    enrollments = list(
        Enrollment.objects.filter(user=request.user)
        .select_related("course", "course__instructor")
        .all()
    )
    active = [e for e in enrollments if e.paid or e.course.price == Decimal("0.00")]
    pending = [e for e in enrollments if not (e.paid or e.course.price == Decimal("0.00"))]
    instructor_count = len({e.course.instructor_id for e in active})
    return render(
        request,
        "courses/dashboard_student.html",
        {
            "enrollments": enrollments,
            "active_enrollments": active,
            "stat_total": len(enrollments),
            "stat_active": len(active),
            "stat_pending": len(pending),
            "stat_instructors": instructor_count,
        },
    )


@login_required
def dashboard_instructor(request):
    redirect_response = _guard_group(
        request,
        GROUP_INSTRUCTOR,
        "The instructor portal is only available to accounts registered as instructors.",
    )
    if redirect_response:
        return redirect_response

    teaching = list(
        Course.objects.filter(instructor=request.user).annotate(
            enrollment_count=Count("enrollments", filter=Q(enrollments__paid=True))
        )
    )
    total_enrollments = sum((c.enrollment_count or 0) for c in teaching)

    subscription = InstructorSubscription.objects.filter(user=request.user).first()

    earnings_chart = _monthly_earnings_series(request.user)

    course_earnings = (
        InstructorEarning.objects.filter(instructor=request.user, payout_request=None)
        .aggregate(total=Sum("payout_amount"))["total"]
        or Decimal("0.00")
    )
    referral_earnings = (
        ReferralEarning.objects.filter(referrer=request.user)
        .aggregate(total=Sum("amount"))["total"]
        or Decimal("0.00")
    )
    pending_balance = course_earnings + referral_earnings
    total_earned = (
        InstructorEarning.objects.filter(instructor=request.user)
        .aggregate(total=Sum("payout_amount"))["total"]
        or Decimal("0.00")
    ) + referral_earnings
    referral_count = ReferralEarning.objects.filter(referrer=request.user).count()
    payout_requests = PayoutRequest.objects.filter(instructor=request.user).order_by("-requested_at")[:5]

    return render(
        request,
        "courses/dashboard_instructor.html",
        {
            "courses": teaching,
            "subscription": subscription,
            "pending_balance": pending_balance,
            "total_earned": total_earned,
            "can_request_payout": pending_balance >= PAYOUT_MINIMUM,
            "payout_minimum": PAYOUT_MINIMUM,
            "payout_requests": payout_requests,
            "earnings_chart": earnings_chart,
            "total_enrollments": total_enrollments,
            "referral_link": referral_link(request.user, request),
            "referral_count": referral_count,
            "referral_earnings": referral_earnings,
            "course_earnings": course_earnings,
            "stripe_configured": stripe_is_configured(),
            "instructor_price_configured": _instructor_plan_exists(),
        },
    )


def _monthly_earnings_series(user, months: int = 6):
    """Payout-amount totals per month for the last ``months`` months.

    Returns a list of dicts ``{label, amount, pct}`` ordered oldest→newest,
    where ``pct`` is the bar height (0–100) relative to the busiest month.
    """
    from django.utils import timezone

    today = timezone.localdate()
    buckets: list[dict] = []
    year, month = today.year, today.month
    # Build the oldest→newest month windows.
    seq = []
    for _ in range(months):
        seq.append((year, month))
        month -= 1
        if month == 0:
            month = 12
            year -= 1
    seq.reverse()

    totals = {
        (e["y"], e["m"]): e["total"]
        for e in InstructorEarning.objects.filter(instructor=user)
        .annotate(y=ExtractYear("created_at"), m=ExtractMonth("created_at"))
        .values("y", "m")
        .annotate(total=Sum("payout_amount"))
    }

    month_names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    amounts = [float(totals.get((y, m), 0) or 0) for (y, m) in seq]
    peak = max(amounts) if amounts else 0
    for (y, m), amount in zip(seq, amounts):
        buckets.append(
            {
                "label": month_names[m],
                "amount": amount,
                "pct": round((amount / peak) * 100) if peak else 0,
            }
        )
    return buckets


@login_required
@require_http_methods(["GET", "POST"])
def instructor_course_create(request):
    redirect_response = _guard_group(
        request,
        GROUP_INSTRUCTOR,
        "The instructor portal is only available to accounts registered as instructors.",
    )
    if redirect_response:
        return redirect_response

    from .forms import CourseForm, CourseModuleFormSet

    if request.method == "POST":
        result, form, formset, err = _save_course_with_modules(request, instructor=request.user)
        if isinstance(result, Course):
            messages.success(
                request,
                "Course saved and submitted for admin review. It will go live once approved.",
            )
            return redirect(f"{reverse('courses:dashboard_instructor')}?course_created=1")
        if err == "formset":
            messages.error(request, "Please fix the module errors below.")
        elif err == "upload":
            messages.error(request, "We could not upload your files. Please try again.")
        elif err and err not in ("form", "formset", "upload"):
            messages.error(request, err)
        if formset is None:
            formset = CourseModuleFormSet(request.POST, request.FILES)
    else:
        form = CourseForm()
        formset = CourseModuleFormSet()

    return render(
        request,
        "courses/instructor_course_form.html",
        _course_form_context(form, formset, back_url=reverse("courses:dashboard_instructor")),
    )


@login_required
@require_http_methods(["GET", "POST"])
def instructor_course_edit(request, slug):
    redirect_response = _guard_group(request, GROUP_INSTRUCTOR, "Instructors only.")
    if redirect_response:
        return redirect_response

    course = get_object_or_404(Course, slug=slug, instructor=request.user)
    from .forms import CourseForm, CourseModuleFormSet

    if request.method == "POST":
        result, form, formset, err = _save_course_with_modules(request, course=course)
        if isinstance(result, Course):
            messages.success(request, "Course updated.")
            return redirect(f"{reverse('courses:dashboard_instructor')}?course_updated=1")
        if err == "formset":
            messages.error(request, "Please fix the module errors below.")
        elif err == "upload":
            messages.error(request, "We could not upload your files. Please try again.")
        elif err and err not in ("form", "formset", "upload"):
            messages.error(request, err)
    else:
        form = CourseForm(instance=course)
        formset = CourseModuleFormSet(instance=course)

    return render(
        request,
        "courses/instructor_course_form.html",
        _course_form_context(form, formset, is_edit=True, course=course),
    )


@login_required
@require_POST
def instructor_course_pause(request, slug):
    redirect_response = _guard_group(request, GROUP_INSTRUCTOR, "Instructors only.")
    if redirect_response:
        return redirect_response
    course = get_object_or_404(Course, slug=slug, instructor=request.user)
    if course.status == Course.Status.PUBLISHED:
        course.status = Course.Status.PAUSED
        course.save(update_fields=["status", "updated_at"])
        messages.success(request, f"“{course.title}” has been paused.")
    elif course.status == Course.Status.PAUSED:
        course.status = Course.Status.PUBLISHED
        course.save(update_fields=["status", "updated_at"])
        messages.success(request, f"“{course.title}” is live again.")
    return redirect("courses:dashboard_instructor")


@login_required
@require_POST
def instructor_course_delete(request, slug):
    redirect_response = _guard_group(request, GROUP_INSTRUCTOR, "Instructors only.")
    if redirect_response:
        return redirect_response
    course = get_object_or_404(Course, slug=slug, instructor=request.user)
    title = course.title
    course.delete()
    messages.success(request, f"“{title}” has been deleted.")
    return redirect("courses:dashboard_instructor")


@login_required
def dashboard_admin(request):
    redirect_response = _guard_group(
        request,
        GROUP_ADMIN,
        "The admin portal is only available to admin accounts.",
    )
    if redirect_response:
        return redirect_response
    if request.user.is_superuser:
        messages.info(request, "Super admins use the super admin dashboard.")
        return redirect("courses:dashboard_superadmin")

    pending_courses = list(
        Course.objects.filter(status=Course.Status.PENDING_REVIEW)
        .select_related("instructor")
        .order_by("-created_at")[:20]
    )
    return render(
        request,
        "courses/dashboard_admin.html",
        {
            "user_count": User.objects.count(),
            "course_count": Course.objects.count(),
            "published_count": Course.objects.filter(status=Course.Status.PUBLISHED).count(),
            "pending_courses": pending_courses,
            "referral_link": referral_link(request.user, request),
        },
    )


@login_required
def dashboard_superadmin(request):
    if not request.user.is_superuser:
        messages.error(request, "The super admin portal is restricted.")
        return redirect("courses:landing")

    return render(
        request,
        "courses/dashboard_superadmin.html",
        {
            "user_count": User.objects.count(),
            "instructor_count": User.objects.filter(groups__name=GROUP_INSTRUCTOR).distinct().count(),
            "student_count": User.objects.filter(groups__name=GROUP_STUDENT).distinct().count(),
            "admin_count": User.objects.filter(groups__name=GROUP_ADMIN).distinct().count(),
            "referral_link": referral_link(request.user, request),
        },
    )


@login_required
@require_POST
def enroll(request, slug):
    if not user_in_group(request.user, GROUP_STUDENT):
        messages.error(request, "Only student accounts can enroll in courses.")
        return redirect("courses:landing")

    course = get_object_or_404(Course, slug=slug)

    if not course.is_live and course.instructor_id != request.user.id:
        messages.error(request, "This course is not available for enrollment yet.")
        return redirect("courses:landing")

    existing = Enrollment.objects.filter(user=request.user, course=course).first()
    if existing and (existing.paid or course.effective_price == Decimal("0.00")):
        return redirect("courses:course_learn", slug=slug)

    if course.effective_price == Decimal("0.00"):
        Enrollment.objects.get_or_create(
            user=request.user, course=course, defaults={"paid": True}
        )
        messages.success(request, f"You are now enrolled in {course.title}.")
        return redirect("courses:course_learn", slug=slug)

    if not stripe_is_configured():
        messages.error(request, "Payment processing is not available right now.")
        return redirect("courses:landing")

    from .billing import create_course_checkout_session

    try:
        session = create_course_checkout_session(request.user, course, request)
        return redirect(session.url, permanent=False)
    except Exception:
        logger.exception("Failed to create checkout session for course %s", course.pk)
        messages.error(request, "Could not start checkout. Please try again.")
        return redirect("courses:landing")


@login_required
@require_GET
def checkout_success(request):
    return render(request, "courses/checkout_success.html")


@login_required
@require_GET
def checkout_cancel(request):
    course_slug = request.GET.get("course", "")
    return render(request, "courses/checkout_cancel.html", {"course_slug": course_slug})


@login_required
@require_POST
def instructor_subscribe(request):
    redirect_response = _guard_group(
        request,
        GROUP_INSTRUCTOR,
        "Only instructor accounts can subscribe to an instructor plan.",
    )
    if redirect_response:
        return redirect_response

    existing = InstructorSubscription.objects.filter(user=request.user).first()
    if existing and existing.is_active:
        messages.info(request, "You already have an active subscription.")
        return redirect("courses:dashboard_instructor")

    if not stripe_is_configured() or not _instructor_plan_exists():
        messages.error(request, "Subscription billing is not configured yet.")
        return redirect("courses:dashboard_instructor")

    from .billing import create_instructor_subscription_session

    try:
        session = create_instructor_subscription_session(request.user, request)
        return redirect(session.url, permanent=False)
    except Exception:
        logger.exception("Failed to create subscription session for user %s", request.user.pk)
        messages.error(request, "Could not start subscription checkout. Please try again.")
        return redirect("courses:dashboard_instructor")


@login_required
@require_POST
def request_payout(request):
    redirect_response = _guard_group(
        request,
        GROUP_INSTRUCTOR,
        "Only instructor accounts can request payouts.",
    )
    if redirect_response:
        return redirect_response

    with transaction.atomic():
        unpaid_earnings = InstructorEarning.objects.select_for_update().filter(
            instructor=request.user, payout_request=None
        )
        pending_balance = unpaid_earnings.aggregate(total=Sum("payout_amount"))["total"] or Decimal("0.00")

        if pending_balance < PAYOUT_MINIMUM:
            messages.error(
                request,
                f"Your pending balance (${pending_balance:.2f}) is below the ${PAYOUT_MINIMUM} minimum.",
            )
            return redirect("courses:dashboard_instructor")

        payout = PayoutRequest.objects.create(instructor=request.user, amount=pending_balance)
        unpaid_earnings.update(payout_request=payout)

    _send_payout_request_email(request.user, pending_balance, payout)
    messages.success(
        request,
        f"Payout request of ${pending_balance:.2f} submitted. We'll process it shortly.",
    )
    return redirect("courses:dashboard_instructor")


def _send_payout_request_email(instructor, amount: Decimal, payout: PayoutRequest):
    name = instructor.get_full_name() or instructor.username
    subject = f"Payout Request — {name} — ${amount:.2f}"
    body = (
        f"Instructor payout request received.\n\n"
        f"Instructor: {name}\n"
        f"Email: {instructor.email}\n"
        f"Requested amount: ${amount:.2f}\n"
        f"Request ID: {payout.pk}\n"
        f"Requested at: {payout.requested_at}\n\n"
        f"Log in to the Django admin to mark this payout as paid.\n"
    )
    try:
        send_mail(
            subject,
            body,
            settings.DEFAULT_FROM_EMAIL,
            [PAYOUT_ADMIN_EMAIL],
            fail_silently=False,
        )
    except Exception:
        logger.exception("Failed to send payout request email for payout %s", payout.pk)


@csrf_exempt
@require_POST
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
    webhook_secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")

    stripe.api_key = settings.STRIPE_SECRET_KEY

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except (ValueError, stripe.error.SignatureVerificationError):
        return HttpResponse(status=400)

    event_type = event["type"]
    data = event["data"]["object"]

    if event_type == "checkout.session.completed":
        _handle_checkout_completed(data)
    elif event_type in ("customer.subscription.updated", "customer.subscription.deleted"):
        _handle_subscription_change(data)

    return HttpResponse(status=200)


def _handle_checkout_completed(session):
    meta = session.get("metadata") or {}
    purchase_type = meta.get("type")

    if purchase_type == "course_purchase":
        course_id = meta.get("course_id")
        user_id = meta.get("user_id")
        if not course_id or not user_id:
            return

        payment_intent_id = session.get("payment_intent") or ""

        try:
            user = User.objects.get(pk=user_id)
            course = Course.objects.get(pk=course_id)
        except (User.DoesNotExist, Course.DoesNotExist):
            logger.error("Webhook: user %s or course %s not found", user_id, course_id)
            return

        with transaction.atomic():
            enrollment, created = Enrollment.objects.get_or_create(
                user=user,
                course=course,
                defaults={"paid": True, "stripe_payment_intent_id": payment_intent_id},
            )
            if not created and not enrollment.paid:
                enrollment.paid = True
                enrollment.stripe_payment_intent_id = payment_intent_id
                enrollment.save(update_fields=["paid", "stripe_payment_intent_id"])

            if not hasattr(enrollment, "earning"):
                charge = course.effective_price
                payout_amount = (charge * PLATFORM_PAYOUT_RATE).quantize(Decimal("0.01"))
                InstructorEarning.objects.create(
                    instructor=course.instructor,
                    enrollment=enrollment,
                    gross_amount=charge,
                    payout_amount=payout_amount,
                )

    elif purchase_type == "instructor_subscription":
        user_id = meta.get("user_id")
        if not user_id:
            return
        subscription_id = session.get("subscription") or ""
        customer_id = session.get("customer") or ""

        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            logger.error("Webhook: user %s not found for instructor subscription", user_id)
            return

        InstructorSubscription.objects.update_or_create(
            user=user,
            defaults={
                "stripe_subscription_id": subscription_id,
                "stripe_customer_id": customer_id,
                "status": "active",
            },
        )


def _handle_subscription_change(subscription):
    sub_id = subscription.get("id") or ""
    status = subscription.get("status") or ""
    current_period_end = subscription.get("current_period_end")
    period_end = (
        datetime.datetime.fromtimestamp(current_period_end, tz=datetime.timezone.utc)
        if current_period_end
        else None
    )
    InstructorSubscription.objects.filter(stripe_subscription_id=sub_id).update(
        status=status,
        current_period_end=period_end,
    )


@login_required
@require_POST
def admin_course_approve(request, course_id):
    redirect_response = _guard_group(request, GROUP_ADMIN, "Admins only.")
    if redirect_response:
        return redirect_response
    course = get_object_or_404(Course, pk=course_id)
    course.status = Course.Status.PUBLISHED
    course.save(update_fields=["status", "updated_at"])
    messages.success(request, f"“{course.title}” is now live.")
    return redirect("courses:dashboard_admin")


@login_required
@require_POST
def admin_course_reject(request, course_id):
    redirect_response = _guard_group(request, GROUP_ADMIN, "Admins only.")
    if redirect_response:
        return redirect_response
    course = get_object_or_404(Course, pk=course_id)
    course.status = Course.Status.DRAFT
    course.save(update_fields=["status", "updated_at"])
    messages.info(request, f"“{course.title}” was sent back to the instructor.")
    return redirect("courses:dashboard_admin")


@login_required
@require_GET
def serve_knowledge_item(request):
    key = request.GET.get("key", "")
    normalized = normalize_storage_key(key)
    if not normalized:
        return HttpResponseForbidden("Invalid link.")

    if not can_serve_knowledge(request.user, normalized):
        return HttpResponseForbidden("You do not have access to this file.")

    try:
        url = presigned_get_url(object_key=normalized, expires_in=settings.KNOWLEDGE_PRESIGN_EXPIRES)
    except Exception:
        messages.error(request, "We could not open that file. Please try again.")
        return redirect("courses:landing")

    return redirect(url)


@login_required
@require_GET
def admin_entry(request):
    if request.user.is_superuser:
        return redirect("courses:dashboard_superadmin")
    if request.user.is_staff and user_in_group(request.user, GROUP_ADMIN):
        return redirect("courses:dashboard_admin")
    messages.info(request, "You need an admin account to open the admin portal.")
    return redirect("courses:landing")
