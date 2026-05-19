from django.contrib import admin

from .models import UserBillingProfile


@admin.register(UserBillingProfile)
class UserBillingProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "stripe_customer_id", "updated_at")
    search_fields = ("user__email", "user__username", "stripe_customer_id")
    raw_id_fields = ("user",)
    readonly_fields = ("created_at", "updated_at")
