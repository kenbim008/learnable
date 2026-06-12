from django import forms
from django.forms import inlineformset_factory

from .categories import category_choices, subcategory_choices
from .models import Course, CourseModule
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
        help_text="Use modules below for multiple lessons.",
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
            "discount_price",
            "category",
            "subcategory",
            "level",
            "icon_key",
        ]
        labels = {
            "title": "Course title",
            "description": "About this course",
            "price": "Price (USD)",
            "discount_price": "Discount price (optional)",
            "category": "Category",
            "subcategory": "Subcategory",
            "level": "Difficulty level",
            "icon_key": "Course icon",
        }
        widgets = {
            "description": forms.Textarea(attrs={"rows": 4}),
            "icon_key": forms.Select(),
            "category": forms.Select(attrs={"id": "id_category"}),
            "subcategory": forms.Select(attrs={"id": "id_subcategory"}),
            "level": forms.Select(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["category"].choices = [("", "Select category")] + category_choices()
        cat = self.instance.category if self.instance and self.instance.pk else self.data.get("category")
        self.fields["subcategory"].choices = [("", "Select subcategory")] + subcategory_choices(cat)

    def clean(self):
        data = super().clean()
        price = data.get("price")
        discount = data.get("discount_price")
        if discount is not None and price is not None and discount >= price:
            self.add_error("discount_price", "Discount price must be lower than the regular price.")
        category = data.get("category")
        subcategory = data.get("subcategory")
        if category and subcategory:
            valid = {k for k, _ in subcategory_choices(category)}
            if subcategory not in valid:
                self.add_error("subcategory", "Pick a subcategory that matches the selected category.")
        return data

    def save(self, commit=True):
        instance = super().save(commit=False)
        assign_unique_slug_from_title(instance)
        if commit:
            instance.save()
            self.save_m2m()
        return instance


class CourseModuleForm(forms.ModelForm):
    video = forms.FileField(
        required=False,
        label="Module video",
        widget=forms.FileInput(attrs={"accept": _VIDEO_ACCEPT}),
    )

    class Meta:
        model = CourseModule
        fields = ["title", "description", "order"]
        widgets = {
            "description": forms.Textarea(attrs={"rows": 2}),
            "order": forms.NumberInput(attrs={"min": 0}),
        }


CourseModuleFormSet = inlineformset_factory(
    Course,
    CourseModule,
    form=CourseModuleForm,
    extra=1,
    can_delete=True,
    prefix="modules",
)
