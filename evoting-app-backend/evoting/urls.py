from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls", namespace="accounts")),
    path("api/elections/", include("elections.urls", namespace="elections")),
    path("api/voting/", include("voting.urls", namespace="voting")),
    path("api/audit/", include("audit.urls", namespace="audit")),
]
