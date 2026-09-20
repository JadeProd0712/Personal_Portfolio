from django.db import models
from django.utils.text import slugify


# ---------- Shared base ----------
class OrderedContent(models.Model):
    """Adds hide/show and manual ordering to any model that inherits it."""
    is_visible = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0, help_text="Lower numbers appear first")

    class Meta:
        abstract = True
        ordering = ["display_order", "id"]


# ---------- Profile (only one row) ----------
class Profile(models.Model):
    full_name = models.CharField(max_length=100)
    title = models.CharField(max_length=100, help_text="e.g. Full-Stack Developer")
    tagline = models.CharField(max_length=200, blank=True)
    bio = models.TextField(blank=True)
    avatar_url = models.URLField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    public_email = models.EmailField(blank=True)
    website = models.URLField(max_length=500, blank=True)
    github_url = models.URLField(max_length=500, blank=True)
    linkedin_url = models.URLField(max_length=500, blank=True)
    cv_url = models.URLField(max_length=500, blank=True)
    about_image_url = models.URLField(max_length=500, blank=True)
    about_quote = models.CharField(max_length=150, blank=True)
    years_learning = models.PositiveIntegerField(null=True, blank=True)
    available_for_work = models.BooleanField(default=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.full_name


# ---------- Projects ----------
class Project(OrderedContent):
    class ClickBehavior(models.TextChoices):
        CASE_STUDY = "case_study", "Open case study page"
        EXTERNAL = "external", "Open external link directly"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        PUBLISHED = "published", "Published"

    # Basics
    title = models.CharField(max_length=150)
    slug = models.SlugField(max_length=170, unique=True, blank=True)
    summary = models.CharField(max_length=300, blank=True)
    category = models.CharField(max_length=100, blank=True, help_text="e.g. Full Stack, School Project")
    tech_stack = models.CharField(max_length=255, blank=True, help_text="Comma separated: React, Django, PostgreSQL")
    project_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    is_featured = models.BooleanField(default=False)

    # Links and click behavior
    click_behavior = models.CharField(max_length=20, choices=ClickBehavior.choices, default=ClickBehavior.CASE_STUDY)
    live_url = models.URLField(max_length=500, blank=True)
    repo_url = models.URLField(max_length=500, blank=True)
    extra_link_label = models.CharField(max_length=50, blank=True)
    extra_link_url = models.URLField(max_length=500, blank=True)

    # Images
    cover_image_url = models.URLField(max_length=500, blank=True)

    # Case study content
    overview = models.TextField(blank=True)
    problem = models.TextField(blank=True)
    role = models.CharField(max_length=150, blank=True)
    features = models.TextField(blank=True, help_text="One feature per line")
    challenges = models.TextField(blank=True)
    lessons = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta(OrderedContent.Meta):
        pass

    def save(self, *args, **kwargs):
        if not self.slug:
            base = slugify(self.title) or "project"
            slug, n = base, 2
            while Project.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProjectImage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField(max_length=500)
    alt_text = models.CharField(max_length=200, blank=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["display_order", "id"]

    def __str__(self):
        return f"{self.project.title} image {self.pk}"


# ---------- Expertise ----------
class Skill(OrderedContent):
    class Level(models.TextChoices):
        BEGINNER = "beginner", "Beginner"
        INTERMEDIATE = "intermediate", "Intermediate"
        ADVANCED = "advanced", "Advanced"

    name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, blank=True, help_text="e.g. Frontend, Backend, Database, Tools")
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.INTERMEDIATE)
    description = models.TextField(blank=True)
    years = models.PositiveIntegerField(null=True, blank=True)

    class Meta(OrderedContent.Meta):
        pass

    def __str__(self):
        return self.name


class Service(OrderedContent):
    class Status(models.TextChoices):
        AVAILABLE = "available", "Available"
        UNAVAILABLE = "unavailable", "Unavailable"

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    delivery_days = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.AVAILABLE)

    class Meta(OrderedContent.Meta):
        pass

    def __str__(self):
        return self.name


class Certification(OrderedContent):
    name = models.CharField(max_length=150)
    issuing_organization = models.CharField(max_length=150, blank=True)
    description = models.TextField(blank=True)
    issue_date = models.DateField(null=True, blank=True)
    expiration_date = models.DateField(null=True, blank=True)
    credential_url = models.URLField(max_length=500, blank=True)
    image_url = models.URLField(max_length=500, blank=True)

    class Meta(OrderedContent.Meta):
        pass

    def __str__(self):
        return self.name


class Achievement(OrderedContent):
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100, blank=True)
    organization = models.CharField(max_length=150, blank=True)
    achievement_date = models.DateField(null=True, blank=True)
    url = models.URLField(max_length=500, blank=True)
    image_url = models.URLField(max_length=500, blank=True)

    class Meta(OrderedContent.Meta):
        pass

    def __str__(self):
        return self.name


# ---------- About / timeline ----------
class Experience(OrderedContent):
    company_name = models.CharField(max_length=150)
    job_title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True, help_text="Leave empty if current")
    employment_status = models.CharField(max_length=30, blank=True, help_text="e.g. Full-time, Internship, Freelance")

    class Meta(OrderedContent.Meta):
        pass

    def __str__(self):
        return f"{self.job_title} at {self.company_name}"


class Education(OrderedContent):
    school_name = models.CharField(max_length=150)
    degree = models.CharField(max_length=100, blank=True)
    field_of_study = models.CharField(max_length=100, blank=True)
    start_year = models.PositiveIntegerField(null=True, blank=True)
    end_year = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=30, blank=True, help_text="e.g. Ongoing, Graduated")

    class Meta(OrderedContent.Meta):
        pass

    def __str__(self):
        return f"{self.degree} - {self.school_name}"


# ---------- Contact inbox ----------
class ContactMessage(models.Model):
    sender_name = models.CharField(max_length=100)
    sender_email = models.EmailField()
    sender_phone = models.CharField(max_length=20, blank=True)
    subject = models.CharField(max_length=150, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.sender_name}: {self.subject or 'No subject'}"