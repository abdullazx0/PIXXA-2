from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import MediaMetadata
from .serializers import MediaMetadataSerializer
from .device import get_device_id


class MediaMetadataViewSet(viewsets.ModelViewSet):
    """
    CRUD for locally-registered media metadata, scoped to the requesting
    device. Supports:

      GET  /api/media/?kind=photo&search=IMG&album=Camera
      POST /api/media/bulk_register/   (list of items) - upsert in bulk
    """

    serializer_class = MediaMetadataSerializer

    def get_queryset(self):
        device_id = get_device_id(self.request)
        qs = MediaMetadata.objects.filter(device_id=device_id)

        kind = self.request.query_params.get("kind")
        if kind in ("photo", "video"):
            qs = qs.filter(kind=kind)

        album = self.request.query_params.get("album")
        if album:
            qs = qs.filter(album_hint__iexact=album)

        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(
                Q(filename__icontains=search)
                | Q(extension__icontains=search)
                | Q(album_hint__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save(device_id=get_device_id(self.request))

    @action(detail=False, methods=["post"])
    def bulk_register(self, request):
        """Upsert metadata for many local files in one call (on gallery scan)."""
        device_id = get_device_id(request)
        items = request.data if isinstance(request.data, list) else request.data.get("items", [])
        created, updated = 0, 0
        for item in items:
            client_id = item.get("client_id")
            if not client_id:
                continue
            obj, was_created = MediaMetadata.objects.update_or_create(
                device_id=device_id,
                client_id=client_id,
                defaults={
                    "filename": item.get("filename", ""),
                    "extension": item.get("extension", ""),
                    "mime_type": item.get("mime_type", ""),
                    "kind": item.get("kind", "photo"),
                    "size_bytes": item.get("size_bytes"),
                    "width": item.get("width"),
                    "height": item.get("height"),
                    "duration_seconds": item.get("duration_seconds"),
                    "captured_at": item.get("captured_at"),
                    "album_hint": item.get("album_hint", ""),
                },
            )
            created += int(was_created)
            updated += int(not was_created)
        return Response({"created": created, "updated": updated}, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        device_id = get_device_id(request)
        qs = MediaMetadata.objects.filter(device_id=device_id)
        return Response(
            {
                "photos": qs.filter(kind="photo").count(),
                "videos": qs.filter(kind="video").count(),
                "total_bytes": sum(m.size_bytes or 0 for m in qs),
            }
        )
