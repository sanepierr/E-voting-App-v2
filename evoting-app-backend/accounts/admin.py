from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from accounts.models import User, VoterProfile


class VoterProfileInline(admin.StackedInline):
    model = VoterProfile
    can_delete = False
    readonly_fields = ["voter_card_number"]


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["username", "get_full_name", "role", "is_verified", "is_active"]
    list_filter = ["role", "is_verified", "is_active"]
    search_fields = ["username", "first_name", "last_name", "email"]
    inlines = [VoterProfileInline]

    fieldsets = BaseUserAdmin.fieldsets + (
        ("E-Voting", {"fields": ("role", "is_verified")}),
    )


@admin.register(VoterProfile)
class VoterProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "voter_card_number", "national_id", "station", "gender"]
    list_filter = ["gender", "station"]
    search_fields = ["voter_card_number", "national_id", "user__first_name", "user__last_name"]
    readonly_fields = ["voter_card_number"]
