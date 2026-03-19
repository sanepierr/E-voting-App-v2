from django.contrib import admin

from voting.models import Vote


@admin.register(Vote)
class VoteAdmin(admin.ModelAdmin):
    list_display = ["vote_hash", "poll", "voter", "candidate", "abstained", "timestamp"]
    list_filter = ["abstained", "poll", "station"]
    search_fields = ["vote_hash", "voter__first_name", "voter__last_name"]
    readonly_fields = ["vote_hash"]
