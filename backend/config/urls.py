from django.urls import path, include

urlpatterns = [
    path("api/", include("news_api.urls")),
]
