from rest_framework.routers import DefaultRouter
from .views import MediaMetadataViewSet

router = DefaultRouter()
router.register("", MediaMetadataViewSet, basename="media")

urlpatterns = router.urls
