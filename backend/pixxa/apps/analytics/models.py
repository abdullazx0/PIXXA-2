from django.db import models


class WatchTimeEntry(models.Model):
    """
    One logged chunk of actual video-watching time. The frontend only
    sends a chunk when a video was genuinely visible and playing (see
    useWatchTime hook) - paused/off-screen/background time is never sent.
    """

    SOURCE_CHOICES = (
        ("videos", "Videos"),
        ("reels", "Reels"),
        ("feed", "Feed"),
    )

    device_id = models.CharField(max_length=128, db_index=True)
    media_client_id = models.CharField(max_length=128, blank=True)
    source = models.CharField(max_length=16, choices=SOURCE_CHOICES)
    seconds = models.FloatField()
    logged_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-logged_at"]


class UserPreference(models.Model):
    """Simple per-device key/value app preferences (theme, autoplay, etc.)."""

    device_id = models.CharField(max_length=128, db_index=True)
    key = models.CharField(max_length=128)
    value = models.JSONField()

    class Meta:
        unique_together = ("device_id", "key")
