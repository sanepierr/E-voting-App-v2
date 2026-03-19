from django.urls import path

from audit.views import AuditActionTypesView, AuditLogListView

app_name = "audit"

urlpatterns = [
    path("logs/", AuditLogListView.as_view(), name="audit-logs"),
    path("action-types/", AuditActionTypesView.as_view(), name="action-types"),
]
