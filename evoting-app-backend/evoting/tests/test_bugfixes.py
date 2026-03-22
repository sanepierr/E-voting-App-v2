"""
Regression tests for documented bugfixes (see repo root changes.md).
"""
from datetime import date

from django.contrib.auth import get_user_model
from django.test import TestCase
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APIClient

from accounts.models import VoterProfile
from accounts.serializers import AdminCreateSerializer, VoterRegistrationSerializer
from audit.models import AuditLog
from elections.models import Candidate, Poll, PollPosition, Position, VotingStation
from elections.serializers import PollCreateSerializer
from elections.services import CandidateService, PollService

User = get_user_model()


def _dob_years_ago(years):
    d = timezone.now().date()
    try:
        return d.replace(year=d.year - years)
    except ValueError:
        return d.replace(month=2, day=28, year=d.year - years)


class PollToggleAuditLogTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="sa",
            email="sa@test.com",
            password="pass1234",
            role=User.Role.SUPER_ADMIN,
            is_staff=True,
            is_verified=True,
        )
        self.station = VotingStation.objects.create(
            name="S1",
            location="L",
            region="R",
            capacity=100,
        )
        self.position = Position.objects.create(
            title="P1",
            level=Position.Level.NATIONAL,
            max_winners=1,
        )
        self.candidate = Candidate.objects.create(
            full_name="Cand One",
            national_id="nat-poll-audit-1",
            date_of_birth=_dob_years_ago(40),
            gender="M",
            education="bachelors",
            party="P",
        )

    def test_open_from_draft_logs_open_poll(self):
        svc = PollService()
        poll = svc.create(
            {
                "title": "T1",
                "description": "",
                "election_type": Poll.ElectionType.GENERAL,
                "start_date": date(2026, 1, 1),
                "end_date": date(2026, 12, 31),
                "position_ids": [self.position.id],
                "station_ids": [self.station.id],
            },
            self.admin,
        )
        pp = poll.poll_positions.first()
        svc.assign_candidates(pp.id, [self.candidate.id], self.admin)

        svc.toggle_status(poll.id, "open", self.admin)

        self.assertTrue(
            AuditLog.objects.filter(action="OPEN_POLL", user_identifier="sa").exists()
        )

    def test_reopen_from_closed_logs_reopen_poll(self):
        svc = PollService()
        poll = svc.create(
            {
                "title": "T2",
                "description": "",
                "election_type": Poll.ElectionType.GENERAL,
                "start_date": date(2026, 1, 1),
                "end_date": date(2026, 12, 31),
                "position_ids": [self.position.id],
                "station_ids": [self.station.id],
            },
            self.admin,
        )
        pp = poll.poll_positions.first()
        svc.assign_candidates(pp.id, [self.candidate.id], self.admin)
        svc.toggle_status(poll.id, "open", self.admin)
        svc.toggle_status(poll.id, "close", self.admin)
        AuditLog.objects.all().delete()

        svc.toggle_status(poll.id, "open", self.admin)

        self.assertTrue(
            AuditLog.objects.filter(action="REOPEN_POLL", user_identifier="sa").exists()
        )


class CandidateSearchTests(TestCase):
    def setUp(self):
        Candidate.objects.create(
            full_name="Young",
            national_id="cs-1",
            date_of_birth=_dob_years_ago(30),
            gender="M",
            education="bachelors",
            party="A",
        )
        Candidate.objects.create(
            full_name="Mid",
            national_id="cs-2",
            date_of_birth=_dob_years_ago(40),
            gender="M",
            education="bachelors",
            party="B",
        )
        Candidate.objects.create(
            full_name="Old",
            national_id="cs-3",
            date_of_birth=_dob_years_ago(50),
            gender="M",
            education="bachelors",
            party="C",
        )

    def test_min_and_max_age_together(self):
        svc = CandidateService()
        qs = svc.search({"min_age": "35", "max_age": "45"})
        names = set(qs.values_list("full_name", flat=True))
        self.assertEqual(names, {"Mid"})

    def test_min_gt_max_returns_empty(self):
        svc = CandidateService()
        qs = svc.search({"min_age": "50", "max_age": "30"})
        self.assertEqual(qs.count(), 0)


class SerializerInactiveEntityTests(TestCase):
    def setUp(self):
        self.station_active = VotingStation.objects.create(
            name="Act",
            location="L",
            region="R",
            capacity=10,
            is_active=True,
        )
        self.station_inactive = VotingStation.objects.create(
            name="Inact",
            location="L",
            region="R",
            capacity=10,
            is_active=False,
        )
        self.position_active = Position.objects.create(
            title="PA",
            level=Position.Level.NATIONAL,
            max_winners=1,
            is_active=True,
        )
        self.position_inactive = Position.objects.create(
            title="PI",
            level=Position.Level.NATIONAL,
            max_winners=1,
            is_active=False,
        )

    def test_poll_create_rejects_inactive_position(self):
        s = PollCreateSerializer(
            data={
                "title": "P",
                "election_type": Poll.ElectionType.GENERAL,
                "start_date": "2026-01-01",
                "end_date": "2026-12-31",
                "position_ids": [self.position_inactive.id],
                "station_ids": [self.station_active.id],
            }
        )
        self.assertFalse(s.is_valid())
        self.assertIn("position_ids", s.errors)

    def test_voter_registration_rejects_inactive_station(self):
        s = VoterRegistrationSerializer(
            data={
                "full_name": "V Voter",
                "national_id": "nid-vr-1",
                "date_of_birth": "1990-01-01",
                "gender": "M",
                "address": "A",
                "phone": "1",
                "email": "v@test.com",
                "station_id": self.station_inactive.id,
                "password": "secret12",
                "confirm_password": "secret12",
            }
        )
        self.assertFalse(s.is_valid())
        self.assertIn("station_id", s.errors)


class AdminCreateRoleTests(TestCase):
    def test_rejects_voter_role(self):
        s = AdminCreateSerializer(
            data={
                "username": "u1",
                "full_name": "N N",
                "email": "u1@test.com",
                "role": User.Role.VOTER,
                "password": "secret12",
            }
        )
        self.assertFalse(s.is_valid())
        self.assertIn("role", s.errors)


class ClosedResultsPermissionTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.station = VotingStation.objects.create(
            name="S",
            location="L",
            region="R",
            capacity=50,
        )
        self.voter = User.objects.create_user(
            username="voter1",
            email="v1@test.com",
            password="pass1234",
            role=User.Role.VOTER,
            is_verified=True,
        )
        VoterProfile.objects.create(
            user=self.voter,
            national_id="vp-closed-1",
            date_of_birth=_dob_years_ago(30),
            gender="M",
            address="A",
            phone="1",
            station=self.station,
        )

    def test_unauthenticated_returns_401(self):
        url = reverse("voting:closed-results")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 401)

    def test_verified_voter_ok(self):
        self.client.force_authenticate(user=self.voter)
        url = reverse("voting:closed-results")
        r = self.client.get(url)
        self.assertEqual(r.status_code, 200)
        self.assertIsInstance(r.json(), list)
