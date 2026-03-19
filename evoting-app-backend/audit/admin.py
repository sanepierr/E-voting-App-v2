from django.contrib import admin

from audit.models import AuditLog


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ["timestamp", "action", "user_identifier", "details"]
    list_filter = ["action"]
    search_fields = ["user_identifier", "details", "action"]
    readonly_fields = ["timestamp", "action", "user_identifier", "details"]
    date_hierarchy = "timestamp"
