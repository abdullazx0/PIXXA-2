from django.contrib import admin
from .models import MediaMetadata


@admin.register(MediaMetadata)
class MediaMetadataAdmin(admin.ModelAdmin):
    list_display = ("filename", "kind", "device_id", "size_bytes", "captured_at")
    list_filter = ("kind",)
    search_fields = ("filename", "device_id", "album_hint")
