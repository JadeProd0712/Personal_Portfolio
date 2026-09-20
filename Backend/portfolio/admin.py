from django.contrib import admin
from .models import (
    Profile, Project, ProjectImage, Skill, Service,
    Certification, Achievement, Experience, Education, ContactMessage,
)


class ProjectImageInline(admin.TabularInline):
    model = ProjectImage
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "is_featured", "click_behavior", "display_order", "is_visible")
    list_editable = ("status", "is_featured", "display_order", "is_visible")
    list_filter = ("status", "category", "is_featured")
    search_fields = ("title", "summary", "tech_stack")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProjectImageInline]


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ("full_name", "title", "available_for_work", "updated_at")

    def has_add_permission(self, request):
        # Only one profile is allowed
        return not Profile.objects.exists()


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "level", "display_order", "is_visible")
    list_editable = ("display_order", "is_visible")
    list_filter = ("category", "level")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("sender_name", "sender_email", "subject", "is_read", "created_at")
    list_editable = ("is_read",)
    list_filter = ("is_read",)
    readonly_fields = ("created_at",)


for model in (Service, Certification, Achievement, Experience, Education):
    admin.site.register(model)