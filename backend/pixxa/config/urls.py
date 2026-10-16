from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/media/", include("pixxa.apps.media.urls")),
    path("api/albums/", include("pixxa.apps.albums.urls")),
    path("api/", include("pixxa.apps.favorites.urls")),
    path("api/analytics/", include("pixxa.apps.analytics.urls")),
]
