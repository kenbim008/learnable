from django.contrib import admin

from .models import Course, Enrollment


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "icon_key", "instructor", "price", "created_at")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "slug", "instructor__email")
    raw_id_fields = ("instructor",)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "created_at")
    raw_id_fields = ("user", "course")
