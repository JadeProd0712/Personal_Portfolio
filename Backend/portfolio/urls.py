from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView
from .admin_api import LoginView, router
from .uploads import UploadView
from . import views

urlpatterns = [
    path("health/", views.health),
    path("profile/", views.ProfileView.as_view()),
    path("projects/", views.ProjectListView.as_view()),
    path("projects/<slug:slug>/", views.ProjectDetailView.as_view()),
    path("skills/", views.SkillListView.as_view()),
    path("services/", views.ServiceListView.as_view()),
    path("certifications/", views.CertificationListView.as_view()),
    path("achievements/", views.AchievementListView.as_view()),
    path("experience/", views.ExperienceListView.as_view()),
    path("education/", views.EducationListView.as_view()),
    path("contact/", views.ContactCreateView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("manage/", include(router.urls)),
    path("manage/upload/", UploadView.as_view()),
    path("resume/", views.ResumeView.as_view()),

]