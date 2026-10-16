from django.db import models


class Favorite(models.Model):
    """Media the user explicitly saved into their Favorites collection."""

    device_id = models.CharField(max_length=128, db_index=True)
    media_client_id = models.CharField(max_length=128, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("device_id", "media_client_id")


class Like(models.Model):
    """A lightweight interaction state, separate from Favorite."""

    device_id = models.CharField(max_length=128, db_index=True)
    media_client_id = models.CharField(max_length=128, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("device_id", "media_client_id")
