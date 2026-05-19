from django.urls import path

from . import views

app_name = "courses"

urlpatterns = [
    path("", views.landing, name="landing"),
    path("community/", views.community, name="community"),
    path("dashboard/student/", views.dashboard_student, name="dashboard_student"),
    path("dashboard/instructor/", views.dashboard_instructor, name="dashboard_instructor"),
    path("instructor/courses/new/", views.instructor_course_create, name="instructor_course_create"),
    path("dashboard/admin/", views.dashboard_admin, name="dashboard_admin"),
    path("dashboard/superadmin/", views.dashboard_superadmin, name="dashboard_superadmin"),
    path("courses/<slug:slug>/", views.course_learn, name="course_learn"),
    path("courses/<slug:slug>/enroll/", views.enroll, name="enroll"),
    path("serve/knowledge/", views.serve_knowledge_item, name="serve_knowledge"),
    path("admin-entry/", views.admin_entry, name="admin_entry"),
]
