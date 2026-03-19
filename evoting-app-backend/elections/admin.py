from django.contrib import admin

from elections.models import Candidate, Poll, PollPosition, Position, VotingStation


@admin.register(VotingStation)
class VotingStationAdmin(admin.ModelAdmin):
    list_display = ["name", "location", "region", "capacity", "is_active"]
    list_filter = ["is_active", "region"]
    search_fields = ["name", "location"]


@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ["full_name", "party", "education", "is_active", "is_approved"]
    list_filter = ["is_active", "is_approved", "education", "party"]
    search_fields = ["full_name", "national_id", "party"]


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ["title", "level", "max_winners", "is_active"]
    list_filter = ["level", "is_active"]


class PollPositionInline(admin.TabularInline):
    model = PollPosition
    extra = 0
    filter_horizontal = ["candidates"]


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ["title", "election_type", "status", "start_date", "end_date"]
    list_filter = ["status", "election_type"]
    search_fields = ["title"]
    inlines = [PollPositionInline]
    filter_horizontal = ["stations"]
