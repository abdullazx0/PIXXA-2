from rest_framework.routers import DefaultRouter
from .views import WatchTimeViewSet, UserPreferenceViewSet

router = DefaultRouter()
router.register("watchtime", WatchTimeViewSet, basename="watchtime")
router.register("preferences", UserPreferenceViewSet, basename="preference")

urlpatterns = router.urls
