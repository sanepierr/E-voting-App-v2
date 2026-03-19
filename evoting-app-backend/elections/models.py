from django.conf import settings
from django.db import models
from django.utils import timezone


class VotingStation(models.Model):
    name = models.CharField(max_length=200)
    location = models.CharField(max_length=300)
    region = models.CharField(max_length=100)
    capacity = models.PositiveIntegerField()
    supervisor = models.CharField(max_length=200, blank=True)
    contact = models.CharField(max_length=50, blank=True)
    opening_time = models.TimeField(default="08:00")
    closing_time = models.TimeField(default="17:00")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_stations",
    )

    @property
    def registered_voter_count(self):
        return self.registered_voters.count()

    @property
    def load_percentage(self):
        if self.capacity == 0:
            return 0
        return round(self.registered_voter_count / self.capacity * 100, 1)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.location})"


class Candidate(models.Model):
    EDUCATION_CHOICES = settings.REQUIRED_EDUCATION_LEVELS

    full_name = models.CharField(max_length=200)
    national_id = models.CharField(max_length=50, unique=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=10)
    education = models.CharField(max_length=20, choices=EDUCATION_CHOICES)
    party = models.CharField(max_length=100)
    manifesto = models.TextField(blank=True)
    address = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    has_criminal_record = models.BooleanField(default=False)
    years_experience = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_candidates",
    )

    @property
    def age(self):
        today = timezone.now().date()
        born = self.date_of_birth
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

    class Meta:
        ordering = ["full_name"]

    def __str__(self):
        return f"{self.full_name} ({self.party})"


class Position(models.Model):
    class Level(models.TextChoices):
        NATIONAL = "National", "National"
        REGIONAL = "Regional", "Regional"
        LOCAL = "Local", "Local"

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    level = models.CharField(max_length=10, choices=Level.choices)
    max_winners = models.PositiveIntegerField(default=1)
    min_candidate_age = models.PositiveIntegerField(default=settings.MIN_CANDIDATE_AGE)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_positions",
    )

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return f"{self.title} ({self.get_level_display()})"


class Poll(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        OPEN = "open", "Open"
        CLOSED = "closed", "Closed"

    class ElectionType(models.TextChoices):
        GENERAL = "General", "General"
        PRIMARY = "Primary", "Primary"
        BY_ELECTION = "By-election", "By-election"
        REFERENDUM = "Referendum", "Referendum"

    title = models.CharField(max_length=300)
    description = models.TextField(blank=True)
    election_type = models.CharField(max_length=20, choices=ElectionType.choices)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.DRAFT)
    stations = models.ManyToManyField(VotingStation, related_name="polls", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_polls",
    )

    @property
    def total_votes_cast(self):
        return self.votes.values("voter").distinct().count()

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class PollPosition(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name="poll_positions")
    position = models.ForeignKey(Position, on_delete=models.CASCADE, related_name="poll_positions")
    candidates = models.ManyToManyField(Candidate, related_name="poll_positions", blank=True)

    class Meta:
        unique_together = ["poll", "position"]
        ordering = ["position__title"]

    def __str__(self):
        return f"{self.poll.title} - {self.position.title}"
