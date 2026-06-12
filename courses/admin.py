from django.contrib import admin

from .models import Course, CourseModule, Enrollment, InstructorEarning, InstructorSubscription, PayoutRequest, StripeProduct


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "status", "category", "instructor", "price", "discount_price", "created_at")
    list_filter = ("status", "category", "level")
    prepopulated_fields = {"slug": ("title",)}
    search_fields = ("title", "slug", "instructor__email")
    raw_id_fields = ("instructor",)
    actions = ["approve_courses", "pause_courses"]

    @admin.action(description="Approve selected courses (publish)")
    def approve_courses(self, request, queryset):
        queryset.update(status=Course.Status.PUBLISHED)

    @admin.action(description="Pause selected courses")
    def pause_courses(self, request, queryset):
        queryset.update(status=Course.Status.PAUSED)


class CourseModuleInline(admin.TabularInline):
    model = CourseModule
    extra = 0


CourseAdmin.inlines = [CourseModuleInline]


@admin.register(CourseModule)
class CourseModuleAdmin(admin.ModelAdmin):
    list_display = ("title", "course", "order", "created_at")
    raw_id_fields = ("course",)


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ("user", "course", "paid", "stripe_payment_intent_id", "created_at")
    list_filter = ("paid",)
    raw_id_fields = ("user", "course")


@admin.register(InstructorSubscription)
class InstructorSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("user", "status", "stripe_subscription_id", "current_period_end", "updated_at")
    list_filter = ("status",)
    raw_id_fields = ("user",)


@admin.register(InstructorEarning)
class InstructorEarningAdmin(admin.ModelAdmin):
    list_display = ("instructor", "enrollment", "gross_amount", "payout_amount", "payout_request", "created_at")
    list_filter = ("payout_request",)
    raw_id_fields = ("instructor", "enrollment", "payout_request")


@admin.register(PayoutRequest)
class PayoutRequestAdmin(admin.ModelAdmin):
    list_display = ("instructor", "amount", "status", "requested_at")
    list_filter = ("status",)
    raw_id_fields = ("instructor",)
    actions = ["mark_paid"]

    @admin.action(description="Mark selected payout requests as paid")
    def mark_paid(self, request, queryset):
        queryset.update(status=PayoutRequest.STATUS_PAID)


@admin.register(StripeProduct)
class StripeProductAdmin(admin.ModelAdmin):
    list_display = ("name", "key", "stripe_product_id", "stripe_price_id", "active", "updated_at")
    list_filter = ("active",)
    readonly_fields = ("created_at", "updated_at")
