from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Favorite, Like
from .serializers import FavoriteSerializer, LikeSerializer
from pixxa.apps.media.device import get_device_id


class FavoriteViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = FavoriteSerializer

    def get_queryset(self):
        return Favorite.objects.filter(device_id=get_device_id(self.request))

    @action(detail=False, methods=["post"])
    def toggle(self, request):
        device_id = get_device_id(request)
        client_id = request.data.get("media_client_id")
        obj = Favorite.objects.filter(device_id=device_id, media_client_id=client_id).first()
        if obj:
            obj.delete()
            return Response({"favorited": False})
        Favorite.objects.create(device_id=device_id, media_client_id=client_id)
        return Response({"favorited": True}, status=status.HTTP_201_CREATED)


class LikeViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LikeSerializer

    def get_queryset(self):
        return Like.objects.filter(device_id=get_device_id(self.request))

    @action(detail=False, methods=["post"])
    def toggle(self, request):
        device_id = get_device_id(request)
        client_id = request.data.get("media_client_id")
        obj = Like.objects.filter(device_id=device_id, media_client_id=client_id).first()
        if obj:
            obj.delete()
            return Response({"liked": False})
        Like.objects.create(device_id=device_id, media_client_id=client_id)
        return Response({"liked": True}, status=status.HTTP_201_CREATED)
