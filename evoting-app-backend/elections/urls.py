from django.urls import path

from elections.views import (
    AssignCandidatesView,
    CandidateDeactivateView,
    CandidateDetailView,
    CandidateListCreateView,
    PollDeleteView,
    PollDetailView,
    PollListCreateView,
    PollToggleStatusView,
    PollUpdateView,
    PositionDeactivateView,
    PositionDetailView,
    PositionListCreateView,
    VotingStationDeactivateView,
    VotingStationDetailView,
    VotingStationListCreateView,
)

app_name = "elections"

urlpatterns = [
    path("candidates/", CandidateListCreateView.as_view(), name="candidate-list-create"),
    path("candidates/<int:pk>/", CandidateDetailView.as_view(), name="candidate-detail"),
    path("candidates/<int:pk>/deactivate/", CandidateDeactivateView.as_view(), name="candidate-deactivate"),

    path("stations/", VotingStationListCreateView.as_view(), name="station-list-create"),
    path("stations/<int:pk>/", VotingStationDetailView.as_view(), name="station-detail"),
    path("stations/<int:pk>/deactivate/", VotingStationDeactivateView.as_view(), name="station-deactivate"),

    path("positions/", PositionListCreateView.as_view(), name="position-list-create"),
    path("positions/<int:pk>/", PositionDetailView.as_view(), name="position-detail"),
    path("positions/<int:pk>/deactivate/", PositionDeactivateView.as_view(), name="position-deactivate"),

    path("polls/", PollListCreateView.as_view(), name="poll-list-create"),
    path("polls/<int:pk>/", PollDetailView.as_view(), name="poll-detail"),
    path("polls/<int:pk>/update/", PollUpdateView.as_view(), name="poll-update"),
    path("polls/<int:pk>/delete/", PollDeleteView.as_view(), name="poll-delete"),
    path("polls/<int:pk>/toggle-status/", PollToggleStatusView.as_view(), name="poll-toggle-status"),
    path("polls/assign-candidates/", AssignCandidatesView.as_view(), name="assign-candidates"),
]
