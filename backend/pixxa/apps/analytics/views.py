from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import WatchTimeEntry, UserPreference
from .serializers import WatchTimeEntrySerializer, UserPreferenceSerializer
from pixxa.apps.media.device import get_device_id


def _fmt(total_seconds: float) -> str:
    total_seconds = int(total_seconds or 0)
    hours, rem = divmod(total_seconds, 3600)
    minutes = rem // 60
    return f"{hours}h {minutes}m"


class WatchTimeViewSet(viewsets.ModelViewSet):
    serializer_class = WatchTimeEntrySerializer
    http_method_names = ["get", "post"]

    def get_queryset(self):
        return WatchTimeEntry.objects.filter(device_id=get_device_id(self.request))

    def perform_create(self, serializer):
        serializer.save(device_id=get_device_id(self.request))

    @action(detail=False, methods=["get"])
    def summary(self, request):
        device_id = get_device_id(request)
        qs = WatchTimeEntry.objects.filter(device_id=device_id)

        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=now.weekday())

        total = sum(e.seconds for e in qs)
        today = sum(e.seconds for e in qs.filter(logged_at__gte=today_start))
        week = sum(e.seconds for e in qs.filter(logged_at__gte=week_start))

        return Response(
            {
                "total_seconds": total,
                "today_seconds": today,
                "week_seconds": week,
                "total_display": _fmt(total),
                "today_display": _fmt(today),
                "week_display": _fmt(week),
            }
        )


class UserPreferenceViewSet(viewsets.ViewSet):
    """
    GET  /api/preferences/            -> {key: value, ...} for this device
    POST /api/preferences/  {key,value} -> upsert one preference
    """

    def list(self, request):
        device_id = get_device_id(request)
        prefs = UserPreference.objects.filter(device_id=device_id)
        return Response({p.key: p.value for p in prefs})

    def create(self, request):
        device_id = get_device_id(request)
        key = request.data.get("key")
        value = request.data.get("value")
        obj, _ = UserPreference.objects.update_or_create(
            device_id=device_id, key=key, defaults={"value": value}
        )
        return Response(UserPreferenceSerializer(obj).data)
