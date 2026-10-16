from django.db import models


class MediaMetadata(models.Model):
    """
    A registered record for one piece of local media.

    PIXXA never stores the actual photo/video bytes on the server. The
    frontend computes a stable `client_id` for each local file (from name +
    size + last-modified) and registers/updates its metadata here so that
    favorites, likes and watch-time can reference it consistently across
    sessions without uploading the file itself.
    """

    KIND_CHOICES = (("photo", "Photo"), ("video", "Video"))

    device_id = models.CharField(max_length=128, db_index=True)
    client_id = models.CharField(max_length=128, db_index=True)

    filename = models.CharField(max_length=512)
    extension = models.CharField(max_length=16, blank=True)
    mime_type = models.CharField(max_length=128, blank=True)
    kind = models.CharField(max_length=8, choices=KIND_CHOICES)

    size_bytes = models.BigIntegerField(null=True, blank=True)
    width = models.IntegerField(null=True, blank=True)
    height = models.IntegerField(null=True, blank=True)
    duration_seconds = models.FloatField(null=True, blank=True)

    captured_at = models.DateTimeField(null=True, blank=True)
    album_hint = models.CharField(max_length=256, blank=True)  # e.g. folder name

    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("device_id", "client_id")
        ordering = ["-captured_at", "-registered_at"]

    def __str__(self):
        return f"{self.filename} ({self.kind})"
