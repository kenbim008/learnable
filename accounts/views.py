from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views.decorators.http import require_http_methods

from .forms import LoginForm, StudentInstructorSignupForm, assign_role_groups
from .navigation import dashboard_url_name


def _redirect_home_for_user(user: User):
    """Marketing home or role dashboard when the user is already signed in."""
    name = dashboard_url_name(user)
    if name:
        return redirect(name)
    return redirect("courses:landing")


@require_http_methods(["GET", "POST"])
def login_view(request):
    if request.user.is_authenticated:
        return _redirect_home_for_user(request.user)

    form = LoginForm(request.POST or None)
    if request.method == "POST" and form.is_valid():
        email = form.cleaned_data["email"].strip().lower()
        password = form.cleaned_data["password"]

        user = authenticate(request, username=email, password=password)
        if user is None:
            messages.error(request, "Invalid email or password.")
            return render(request, "accounts/login.html", {"form": form})

        dashboard = dashboard_url_name(user)
        login(request, user)
        if dashboard is None:
            messages.info(
                request,
                "You are signed in. If you expected a staff or instructor portal, ask your organization's LEARNible administrator to update your account.",
            )
            return redirect("courses:landing")
        return redirect(dashboard)

    return render(request, "accounts/login.html", {"form": form})


@require_http_methods(["GET", "POST"])
def signup_view(request):
    if request.user.is_authenticated:
        return _redirect_home_for_user(request.user)

    initial = {}
    if request.method == "GET" and request.GET.get("role") == "instructor":
        initial["role"] = "instructor"

    if request.method == "POST":
        form = StudentInstructorSignupForm(request.POST)
    else:
        form = StudentInstructorSignupForm(initial=initial)

    if request.method == "POST" and form.is_valid():
        email = form.cleaned_data["email"]
        user = User.objects.create_user(
            username=email,
            email=email,
            password=form.cleaned_data["password"],
            first_name=form.cleaned_data["name"],
        )
        role = form.cleaned_data["role"]
        if role == "instructor":
            assign_role_groups(user, instructor=True)
        else:
            assign_role_groups(user, student=True)
        login(request, user)
        dashboard = (
            "courses:dashboard_instructor" if role == "instructor" else "courses:dashboard_student"
        )
        return redirect(f"{reverse(dashboard)}?welcome=1")

    return render(request, "accounts/signup.html", {"form": form})


@require_http_methods(["GET", "POST"])
def logout_view(request):
    logout(request)
    return redirect(f"{reverse('courses:landing')}?signed_out=1")
