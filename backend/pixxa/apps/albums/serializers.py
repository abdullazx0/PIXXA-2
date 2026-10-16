from rest_framework import serializers
from .models import Album, AlbumItem


class AlbumSerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Album
        fields = ["id", "name", "is_system", "created_at", "item_count"]
        read_only_fields = ["id", "created_at"]

    def get_item_count(self, obj):
        return obj.items.count()


class AlbumItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlbumItem
        fields = ["id", "album", "media_client_id", "added_at"]
        read_only_fields = ["id", "added_at"]
