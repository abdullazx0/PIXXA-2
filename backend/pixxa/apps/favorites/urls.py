from rest_framework.routers import DefaultRouter
from .views import FavoriteViewSet, LikeViewSet

router = DefaultRouter()
router.register("favorites", FavoriteViewSet, basename="favorite")
router.register("likes", LikeViewSet, basename="like")

urlpatterns = router.urls
