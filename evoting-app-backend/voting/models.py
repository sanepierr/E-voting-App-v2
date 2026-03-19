import hashlib

from django.conf import settings
from django.db import models
from django.utils import timezone


class Vote(models.Model):
    vote_hash = models.CharField(max_length=64, unique=True, editable=False)
    poll = models.ForeignKey(
        "elections.Poll",
        on_delete=models.CASCADE,
        related_name="votes",
    )
    poll_position = models.ForeignKey(
        "elections.PollPosition",
        on_delete=models.CASCADE,
        related_name="votes",
    )
    candidate = models.ForeignKey(
        "elections.Candidate",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="received_votes",
    )
    voter = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="votes_cast",
    )
    station = models.ForeignKey(
        "elections.VotingStation",
        on_delete=models.SET_NULL,
        null=True,
        related_name="votes",
    )
    abstained = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.vote_hash:
            self.vote_hash = self._generate_hash()
        super().save(*args, **kwargs)

    def _generate_hash(self):
        raw = f"{self.voter_id}{self.poll_id}{self.poll_position_id}{timezone.now().isoformat()}"
        return hashlib.sha256(raw.encode()).hexdigest()[:16]

    class Meta:
        ordering = ["-timestamp"]
        constraints = [
            models.UniqueConstraint(
                fields=["voter", "poll", "poll_position"],
                name="unique_vote_per_position",
            )
        ]

    def __str__(self):
        if self.abstained:
            return f"Vote(abstain) by {self.voter} in {self.poll}"
        return f"Vote for {self.candidate} by {self.voter} in {self.poll}"
