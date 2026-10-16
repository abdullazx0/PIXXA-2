from rest_framework import serializers
from .models import Favorite, Like


class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ["id", "media_client_id", "created_at"]
        read_only_fields = ["id", "created_at"]


class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ["id", "media_client_id", "created_at"]
        read_only_fields = ["id", "created_at"]
