from django.urls import path

from voting.views import (
    CastVoteView,
    ClosedPollResultsView,
    OpenPollsView,
    PollResultsView,
    StationResultsView,
    SystemStatisticsView,
    VotingHistoryView,
)

app_name = "voting"

urlpatterns = [
    path("open-polls/", OpenPollsView.as_view(), name="open-polls"),
    path("cast/", CastVoteView.as_view(), name="cast-vote"),
    path("history/", VotingHistoryView.as_view(), name="voting-history"),
    path("results/<int:pk>/", PollResultsView.as_view(), name="poll-results"),
    path("results/<int:pk>/stations/", StationResultsView.as_view(), name="station-results"),
    path("results/closed/", ClosedPollResultsView.as_view(), name="closed-results"),
    path("statistics/", SystemStatisticsView.as_view(), name="statistics"),
]
