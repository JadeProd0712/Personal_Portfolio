from django.db import connection
from django.http import JsonResponse
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from .notifications import notify_owner

from .models import (
    Profile, Project, Skill, Service,
    Certification, Achievement, Experience, Education,
)
from .serializers import (
    ProfileSerializer, ProjectListSerializer, ProjectDetailSerializer,
    SkillSerializer, ServiceSerializer, CertificationSerializer,
    AchievementSerializer, ExperienceSerializer, EducationSerializer,
    ContactSerializer,
)


class ProfileView(APIView):
    def get(self, request):
        profile = Profile.objects.first()
        if not profile:
            return Response({"detail": "Profile not set up yet."}, status=404)
        return Response(ProfileSerializer(profile).data)


def published_projects():
    return Project.objects.filter(status=Project.Status.PUBLISHED, is_visible=True)


class ProjectListView(generics.ListAPIView):
    serializer_class = ProjectListSerializer

    def get_queryset(self):
        qs = published_projects()
        if self.request.query_params.get("featured") == "true":
            qs = qs.filter(is_featured=True)
        return qs


class ProjectDetailView(generics.RetrieveAPIView):
    serializer_class = ProjectDetailSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return published_projects().prefetch_related("images")


class VisibleListView(generics.ListAPIView):
    """Base for simple lists that only show items marked visible."""
    model = None

    def get_queryset(self):
        return self.model.objects.filter(is_visible=True)


class SkillListView(VisibleListView):
    model = Skill
    serializer_class = SkillSerializer


class ServiceListView(VisibleListView):
    model = Service
    serializer_class = ServiceSerializer


class CertificationListView(VisibleListView):
    model = Certification
    serializer_class = CertificationSerializer


class AchievementListView(VisibleListView):
    model = Achievement
    serializer_class = AchievementSerializer


class ExperienceListView(VisibleListView):
    model = Experience
    serializer_class = ExperienceSerializer


class EducationListView(VisibleListView):
    model = Education
    serializer_class = EducationSerializer


class ContactCreateView(generics.CreateAPIView):
    serializer_class = ContactSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "contact"

    def perform_create(self, serializer):
        message = serializer.save()
        notify_owner(message)

    def create(self, request, *args, **kwargs):
        # Honeypot: real visitors never see this hidden field, bots fill it in
        if request.data.get("website"):
            return Response({"detail": "Message sent."}, status=201)
        super().create(request, *args, **kwargs)
        return Response({"detail": "Message sent."}, status=201)


class ResumeView(APIView):
    """Everything the CV generator needs, in one request."""

    def get(self, request):
        profile = Profile.objects.first()
        if not profile:
            return Response({"detail": "Profile not set up yet."}, status=404)

        def visible(model, serializer):
            return serializer(model.objects.filter(is_visible=True), many=True).data

        projects = published_projects().prefetch_related("images")
        return Response({
            "profile": ProfileSerializer(profile).data,
            "education": visible(Education, EducationSerializer),
            "experience": visible(Experience, ExperienceSerializer),
            "skills": visible(Skill, SkillSerializer),
            "certifications": visible(Certification, CertificationSerializer),
            "achievements": visible(Achievement, AchievementSerializer),
            "projects": ProjectDetailSerializer(projects, many=True).data,
        })

def health(request):
    """Tiny status page for uptime monitors. Add ?db=1 to also touch the database."""
    if request.GET.get("db"):
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            return JsonResponse({"status": "database unavailable"}, status=503)
    return JsonResponse({"status": "ok"})