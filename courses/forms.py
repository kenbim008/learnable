from django import forms

from .models import Course
from .utils import assign_unique_slug_from_title

_VIDEO_ACCEPT = "video/mp4,video/webm,video/quicktime,video/x-m4v,.mp4,.webm,.mov,.m4v"
_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"


class CourseForm(forms.ModelForm):
    preview_video = forms.FileField(
        required=False,
        label="Preview clip (optional)",
        widget=forms.FileInput(attrs={"accept": _VIDEO_ACCEPT}),
    )
    primary_video = forms.FileField(
        required=False,
        label="Main lesson video (optional)",
        widget=forms.FileInput(attrs={"accept": _VIDEO_ACCEPT}),
    )
    cover_image = forms.FileField(
        required=False,
        label="Cover image (optional)",
        widget=forms.FileInput(attrs={"accept": _IMAGE_ACCEPT}),
    )

    class Meta:
        model = Course
        fields = [
            "title",
            "description",
            "price",
            "icon_key",
        ]
        labels = {
            "title": "Course title",
            "description": "About this course",
            "price": "Price (USD)",
            "icon_key": "Course icon",
        }
        help_texts = {
            "title": "This is the name students see in the catalog.",
            "description": "A few sentences about what someone will learn or get out of it.",
            "price": "Use 0.00 if you want to offer it for free.",
            "icon_key": "Picks the small picture next to your course name.",
        }
        widgets = {
            "description": forms.Textarea(attrs={"rows": 4}),
            "icon_key": forms.Select(),
        }

    def save(self, commit=True):
        instance = super().save(commit=False)
        assign_unique_slug_from_title(instance)
        if commit:
            instance.save()
            self.save_m2m()
        return instance
