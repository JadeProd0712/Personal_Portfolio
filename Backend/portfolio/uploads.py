import os
import uuid

from django.conf import settings
from django.core.files.storage import FileSystemStorage
from PIL import Image, UnidentifiedImageError
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

MAX_BYTES = 5 * 1024 * 1024
FORMATS = {"JPEG": ".jpg", "PNG": ".png", "WEBP": ".webp"}


class UploadView(APIView):
    permission_classes = [permissions.IsAdminUser]
    parser_classes = [MultiPartParser]

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No file was sent."}, status=400)
        if file.size > MAX_BYTES:
            return Response({"detail": "Image must be 5 MB or smaller."}, status=400)
        try:
            with Image.open(file) as img:
                img.verify()
                fmt = img.format
        except (UnidentifiedImageError, OSError):
            return Response({"detail": "That file is not a valid image."}, status=400)
        if fmt not in FORMATS:
            return Response({"detail": "Only JPG, PNG and WebP images are allowed."}, status=400)
        file.seek(0)

        if os.getenv("CLOUDINARY_URL"):
            return self.to_cloudinary(file)
        return self.to_disk(request, file, FORMATS[fmt])

    def to_cloudinary(self, file):
        import cloudinary.uploader
        try:
            result = cloudinary.uploader.upload(file, folder="portfolio", resource_type="image")
        except Exception as e:
            print("CLOUDINARY ERROR:", repr(e))
            return Response({"detail": "Cloudinary upload failed. Check CLOUDINARY_URL."}, status=502)
        url = result["secure_url"].replace("/upload/", "/upload/f_auto,q_auto/", 1)
        return Response({"url": url}, status=201)

    def to_disk(self, request, file, ext):
        storage = FileSystemStorage(location=settings.MEDIA_ROOT, base_url=settings.MEDIA_URL)
        name = storage.save(f"uploads/{uuid.uuid4().hex}{ext}", file)
        return Response({"url": request.build_absolute_uri(storage.url(name))}, status=201)