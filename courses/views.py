from django.conf import settings
from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import HttpResponseForbidden
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from accounts.constants import GROUP_ADMIN, GROUP_INSTRUCTOR, GROUP_STUDENT
from accounts.forms import user_in_group

from .access import can_serve_knowledge, can_view_course_lessons, normalize_storage_key
from .models import Course, Enrollment
from .s3 import presigned_get_url
from .upload import CourseUploadError, apply_course_media_uploads

User = get_user_model()


def landing(request):
    courses = Course.objects.select_related("instructor").all()
    enrolled_ids: set[int] = set()
    is_student = False
    if request.user.is_authenticated:
        is_student = user_in_group(request.user, GROUP_STUDENT)
        enrolled_ids = set(
            Enrollment.objects.filter(user=request.user).values_list("course_id", flat=True)
        )
    return render(
        request,
        "courses/landing.html",
        {
            "courses": courses,
            "enrolled_course_ids": enrolled_ids,
            "is_student": is_student,
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
    course = get_object_or_404(Course.objects.select_related("instructor"), slug=slug)
    is_enrolled = Enrollment.objects.filter(user=request.user, course=course).exists()
    is_instructor = course.instructor_id == request.user.id
    is_student = user_in_group(request.user, GROUP_STUDENT)
    can_watch_lesson = can_view_course_lessons(request.user, course)

    return render(
        request,
        "courses/course_learn.html",
        {
            "course": course,
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
def dashboard_student(request):
    redirect_response = _guard_group(
        request,
        GROUP_STUDENT,
        "The student portal is only available to accounts registered as students.",
    )
    if redirect_response:
        return redirect_response

    enrollments = (
        Enrollment.objects.filter(user=request.user).select_related("course", "course__instructor").all()
    )
    return render(
        request,
        "courses/dashboard_student.html",
        {"enrollments": enrollments},
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

    teaching = Course.objects.filter(instructor=request.user)
    return render(
        request,
        "courses/dashboard_instructor.html",
        {"courses": teaching},
    )


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

    from .forms import CourseForm

    if request.method == "POST":
        form = CourseForm(request.POST, request.FILES)
        if form.is_valid():
            try:
                with transaction.atomic():
                    course = form.save(commit=False)
                    course.instructor = request.user
                    course.save()
                    apply_course_media_uploads(
                        course,
                        preview=form.cleaned_data.get("preview_video"),
                        primary=form.cleaned_data.get("primary_video"),
                        cover=form.cleaned_data.get("cover_image"),
                    )
            except CourseUploadError as exc:
                messages.error(request, str(exc))
                return render(request, "courses/instructor_course_form.html", {"form": form})
            except Exception:
                messages.error(
                    request,
                    "We could not upload your files. Please try again in a moment.",
                )
                return render(request, "courses/instructor_course_form.html", {"form": form})
            return redirect(f"{reverse('courses:dashboard_instructor')}?course_created=1")
    else:
        form = CourseForm()
    return render(request, "courses/instructor_course_form.html", {"form": form})


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

    return render(
        request,
        "courses/dashboard_admin.html",
        {
            "user_count": User.objects.count(),
            "course_count": Course.objects.count(),
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
        },
    )


@login_required
@require_POST
def enroll(request, slug):
    if not user_in_group(request.user, GROUP_STUDENT):
        messages.error(request, "Only student accounts can enroll in courses.")
        return redirect("courses:landing")

    course = get_object_or_404(Course, slug=slug)
    Enrollment.objects.get_or_create(user=request.user, course=course)
    messages.success(request, f"You are now enrolled in {course.title}.")
    return redirect("courses:course_learn", slug=slug)


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
