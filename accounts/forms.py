from django import forms
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError

from .constants import GROUP_ADMIN, GROUP_INSTRUCTOR, GROUP_STUDENT, GROUP_SUPERADMIN

User = get_user_model()


class LoginForm(forms.Form):
    email = forms.EmailField()
    password = forms.CharField(widget=forms.PasswordInput)


class StudentInstructorSignupForm(forms.Form):
    name = forms.CharField(max_length=150)
    email = forms.EmailField()
    password = forms.CharField(min_length=8, widget=forms.PasswordInput)
    confirm_password = forms.CharField(widget=forms.PasswordInput)
    role = forms.ChoiceField(choices=[("student", "Student"), ("instructor", "Instructor")], widget=forms.RadioSelect)

    def clean_email(self):
        email = self.cleaned_data["email"].strip().lower()
        if User.objects.filter(username=email).exists():
            raise ValidationError("An account with this email already exists.")
        return email

    def clean(self):
        data = super().clean()
        if data.get("password") != data.get("confirm_password"):
            raise ValidationError("Passwords do not match.")
        return data


def _group(name: str) -> Group:
    return Group.objects.get(name=name)


def assign_role_groups(user: User, *, student=False, instructor=False, admin=False, superadmin=False):
    user.groups.clear()
    if superadmin:
        user.groups.add(_group(GROUP_SUPERADMIN))
        return
    if admin:
        user.groups.add(_group(GROUP_ADMIN))
        return
    if instructor:
        user.groups.add(_group(GROUP_INSTRUCTOR))
        return
    if student:
        user.groups.add(_group(GROUP_STUDENT))


def user_in_group(user: User, name: str) -> bool:
    if not user.is_authenticated:
        return False
    return user.groups.filter(name=name).exists()
