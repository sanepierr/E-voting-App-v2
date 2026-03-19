from django.contrib.auth import get_user_model
from django.contrib.auth.backends import BaseBackend

from accounts.models import VoterProfile

User = get_user_model()


class VoterCardBackend(BaseBackend):
    def authenticate(self, request, voter_card_number=None, password=None, **kwargs):
        if not voter_card_number:
            return None
        try:
            profile = VoterProfile.objects.select_related("user").get(
                voter_card_number=voter_card_number
            )
        except VoterProfile.DoesNotExist:
            return None
        user = profile.user
        if user.check_password(password) and user.is_active:
            return user
        return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
