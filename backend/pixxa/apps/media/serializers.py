from rest_framework import serializers
from .models import MediaMetadata


class MediaMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaMetadata
        fields = [
            "id",
            "client_id",
            "filename",
            "extension",
            "mime_type",
            "kind",
            "size_bytes",
            "width",
            "height",
            "duration_seconds",
            "captured_at",
            "album_hint",
            "registered_at",
            "updated_at",
        ]
        read_only_fields = ["id", "registered_at", "updated_at"]
