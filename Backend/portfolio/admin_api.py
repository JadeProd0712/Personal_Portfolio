from rest_framework import permissions, serializers, viewsets
from rest_framework.routers import SimpleRouter
from rest_framework.throttling import ScopedRateThrottle
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Profile, Project, ProjectImage, Skill, Service,
    Certification, Achievement, Experience, Education, ContactMessage,
)


class LoginView(TokenObtainPairView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"


def build_viewset(model, filter_fields=()):
    meta = type("Meta", (), {"model": model, "fields": "__all__"})
    serializer = type(f"{model.__name__}AdminSerializer", (serializers.ModelSerializer,), {"Meta": meta})

    class AdminViewSet(viewsets.ModelViewSet):
        serializer_class = serializer
        permission_classes = [permissions.IsAdminUser]

        def get_queryset(self):
            qs = model.objects.all()
            for field in filter_fields:
                value = self.request.query_params.get(field)
                if value:
                    qs = qs.filter(**{field: value})
            return qs

    return AdminViewSet


router = SimpleRouter()
router.register("profile", build_viewset(Profile), basename="admin-profile")
router.register("projects", build_viewset(Project), basename="admin-projects")
router.register("project-images", build_viewset(ProjectImage, ("project",)), basename="admin-project-images")
router.register("skills", build_viewset(Skill), basename="admin-skills")
router.register("experience", build_viewset(Experience), basename="admin-experience")
router.register("education", build_viewset(Education), basename="admin-education")
router.register("certifications", build_viewset(Certification), basename="admin-certifications")
router.register("achievements", build_viewset(Achievement), basename="admin-achievements")
router.register("services", build_viewset(Service), basename="admin-services")
router.register("messages", build_viewset(ContactMessage), basename="admin-messages")