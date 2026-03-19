from django.db import models


class AuditLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    action = models.CharField(max_length=50, db_index=True)
    user_identifier = models.CharField(max_length=200, db_index=True)
    details = models.TextField(blank=True)

    class Meta:
        ordering = ["-timestamp"]
        indexes = [
            models.Index(fields=["action", "timestamp"]),
            models.Index(fields=["user_identifier", "timestamp"]),
        ]

    def __str__(self):
        return f"[{self.timestamp:%Y-%m-%d %H:%M}] {self.action} by {self.user_identifier}"
