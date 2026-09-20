from rest_framework import serializers
from .models import (
    Profile, Project, ProjectImage, Skill, Service,
    Certification, Achievement, Experience, Education, ContactMessage,
)


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            "full_name", "title", "tagline", "bio", "avatar_url", "location",
            "public_email", "website", "github_url", "linkedin_url",
            "cv_url", "available_for_work",
            "about_image_url", "about_quote", "years_learning",
        ]


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ["id", "image_url", "alt_text"]


class ProjectListSerializer(serializers.ModelSerializer):
    tech_list = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = [
            "id", "title", "slug", "summary", "category", "tech_list",
            "cover_image_url", "is_featured", "click_behavior",
            "live_url", "repo_url", "project_date",
        ]

    def get_tech_list(self, obj):
        return [t.strip() for t in obj.tech_stack.split(",") if t.strip()]


class ProjectDetailSerializer(ProjectListSerializer):
    images = ProjectImageSerializer(many=True, read_only=True)
    features_list = serializers.SerializerMethodField()

    class Meta(ProjectListSerializer.Meta):
        fields = ProjectListSerializer.Meta.fields + [
            "extra_link_label", "extra_link_url", "overview", "problem",
            "role", "features_list", "challenges", "lessons", "images",
        ]

    def get_features_list(self, obj):
        return [f.strip() for f in obj.features.splitlines() if f.strip()]


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name", "category", "level", "description", "years"]


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = ["id", "name", "description", "category", "price", "delivery_days", "status"]


class CertificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Certification
        fields = ["id", "name", "issuing_organization", "description",
                  "issue_date", "expiration_date", "credential_url","image_url"]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ["id", "name", "description", "category", "organization",
                  "achievement_date", "url","image_url"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ["id", "company_name", "job_title", "description",
                  "start_date", "end_date", "employment_status"]


class EducationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Education
        fields = ["id", "school_name", "degree", "field_of_study",
                  "start_year", "end_year", "status"]


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["sender_name", "sender_email", "sender_phone", "subject", "message"]