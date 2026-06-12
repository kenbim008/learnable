from django.urls import path

from . import views

app_name = "courses"

urlpatterns = [
    path("", views.landing, name="landing"),
    path("community/", views.community, name="community"),
    path("dashboard/", views.dashboard, name="dashboard"),
    # Legacy redirects for backwards compatibility
    path("dashboard/student/", views.dashboard_student_redirect, name="dashboard_student"),
    path("dashboard/instructor/", views.dashboard_instructor_redirect, name="dashboard_instructor"),
    path("dashboard/admin/", views.dashboard_admin_redirect, name="dashboard_admin"),
    path("dashboard/superadmin/", views.dashboard_superadmin_redirect, name="dashboard_superadmin"),
    path("instructor/courses/new/", views.instructor_course_create, name="instructor_course_create"),
    path("instructor/courses/<slug:slug>/edit/", views.instructor_course_edit, name="instructor_course_edit"),
    path("instructor/courses/<slug:slug>/pause/", views.instructor_course_pause, name="instructor_course_pause"),
    path("instructor/courses/<slug:slug>/delete/", views.instructor_course_delete, name="instructor_course_delete"),
    path("admin/courses/<int:course_id>/approve/", views.admin_course_approve, name="admin_course_approve"),
    path("admin/courses/<int:course_id>/reject/", views.admin_course_reject, name="admin_course_reject"),
    path("instructor/subscribe/", views.instructor_subscribe, name="instructor_subscribe"),
    path("instructor/payout/request/", views.request_payout, name="request_payout"),
    path("courses/<slug:slug>/", views.course_learn, name="course_learn"),
    path("courses/<slug:slug>/enroll/", views.enroll, name="enroll"),
    path("checkout/success/", views.checkout_success, name="checkout_success"),
    path("checkout/cancel/", views.checkout_cancel, name="checkout_cancel"),
    path("serve/knowledge/", views.serve_knowledge_item, name="serve_knowledge"),
    path("admin-entry/", views.admin_entry, name="admin_entry"),
    path("webhook", views.stripe_webhook, name="stripe_webhook"),
]
