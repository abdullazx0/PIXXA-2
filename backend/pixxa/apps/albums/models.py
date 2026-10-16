from django.db import models


class Album(models.Model):
    """
    An album, either detected from the device's real folder structure
    (is_system=True, e.g. "Camera", "Screenshots", "WhatsApp Images") or
    created by the user inside the app (is_system=False).
    """

    device_id = models.CharField(max_length=128, db_index=True)
    name = models.CharField(max_length=256)
    is_system = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("device_id", "name")
        ordering = ["name"]

    def __str__(self):
        return self.name


class AlbumItem(models.Model):
    """Links a media client_id (see pixxa_media.MediaMetadata) to an album."""

    album = models.ForeignKey(Album, related_name="items", on_delete=models.CASCADE)
    media_client_id = models.CharField(max_length=128, db_index=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("album", "media_client_id")
