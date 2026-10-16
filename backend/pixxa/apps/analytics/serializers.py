from rest_framework import serializers
from .models import WatchTimeEntry, UserPreference


class WatchTimeEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = WatchTimeEntry
        fields = ["id", "media_client_id", "source", "seconds", "logged_at"]
        read_only_fields = ["id", "logged_at"]


class UserPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPreference
        fields = ["id", "key", "value"]
        read_only_fields = ["id"]
