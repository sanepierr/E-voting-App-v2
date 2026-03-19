import random
import string

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone


class User(AbstractUser):
    class Role(models.TextChoices):
        SUPER_ADMIN = "super_admin", "Super Admin"
        ELECTION_OFFICER = "election_officer", "Election Officer"
        STATION_MANAGER = "station_manager", "Station Manager"
        AUDITOR = "auditor", "Auditor"
        VOTER = "voter", "Voter"

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.VOTER)
    is_verified = models.BooleanField(default=False)

    ADMIN_ROLES = {
        Role.SUPER_ADMIN,
        Role.ELECTION_OFFICER,
        Role.STATION_MANAGER,
        Role.AUDITOR,
    }

    @property
    def is_admin_user(self):
        return self.role in self.ADMIN_ROLES

    @property
    def is_voter_user(self):
        return self.role == self.Role.VOTER

    @property
    def is_super_admin(self):
        return self.role == self.Role.SUPER_ADMIN

    class Meta:
        ordering = ["-date_joined"]

    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"


class VoterProfile(models.Model):
    class Gender(models.TextChoices):
        MALE = "M", "Male"
        FEMALE = "F", "Female"
        OTHER = "OTHER", "Other"

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="voter_profile",
    )
    national_id = models.CharField(max_length=50, unique=True)
    voter_card_number = models.CharField(max_length=12, unique=True, editable=False)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=5, choices=Gender.choices)
    address = models.TextField()
    phone = models.CharField(max_length=20)
    station = models.ForeignKey(
        "elections.VotingStation",
        on_delete=models.SET_NULL,
        null=True,
        related_name="registered_voters",
    )

    @property
    def age(self):
        today = timezone.now().date()
        born = self.date_of_birth
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

    def save(self, *args, **kwargs):
        if not self.voter_card_number:
            self.voter_card_number = self._generate_card_number()
        super().save(*args, **kwargs)

    @staticmethod
    def _generate_card_number():
        while True:
            number = "".join(random.choices(string.ascii_uppercase + string.digits, k=12))
            if not VoterProfile.objects.filter(voter_card_number=number).exists():
                return number

    class Meta:
        ordering = ["-user__date_joined"]

    def __str__(self):
        return f"{self.user.get_full_name()} [{self.voter_card_number}]"
