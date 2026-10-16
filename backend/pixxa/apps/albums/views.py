from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Album, AlbumItem
from .serializers import AlbumSerializer, AlbumItemSerializer
from pixxa.apps.media.device import get_device_id


class AlbumViewSet(viewsets.ModelViewSet):
    serializer_class = AlbumSerializer

    def get_queryset(self):
        return Album.objects.filter(device_id=get_device_id(self.request))

    def perform_create(self, serializer):
        serializer.save(device_id=get_device_id(self.request))

    @action(detail=True, methods=["post"])
    def add_item(self, request, pk=None):
        album = self.get_object()
        client_id = request.data.get("media_client_id")
        AlbumItem.objects.get_or_create(album=album, media_client_id=client_id)
        return Response(AlbumSerializer(album).data)

    @action(detail=True, methods=["post"])
    def remove_item(self, request, pk=None):
        album = self.get_object()
        client_id = request.data.get("media_client_id")
        AlbumItem.objects.filter(album=album, media_client_id=client_id).delete()
        return Response(AlbumSerializer(album).data)

    @action(detail=True, methods=["get"])
    def items(self, request, pk=None):
        album = self.get_object()
        client_ids = list(album.items.values_list("media_client_id", flat=True))
        return Response({"media_client_ids": client_ids})
