from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import (
    AdminCreateView,
    AdminDeactivateView,
    AdminListView,
    AdminLoginView,
    ChangePasswordView,
    VoterDeactivateView,
    VoterListView,
    VoterLoginView,
    VoterProfileView,
    VoterRegistrationView,
    VoterVerifyAllView,
    VoterVerifyView,
)

app_name = "accounts"

urlpatterns = [
    path("login/admin/", AdminLoginView.as_view(), name="admin-login"),
    path("login/voter/", VoterLoginView.as_view(), name="voter-login"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("register/", VoterRegistrationView.as_view(), name="voter-register"),
    path("profile/", VoterProfileView.as_view(), name="voter-profile"),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("voters/", VoterListView.as_view(), name="voter-list"),
    path("voters/<int:pk>/verify/", VoterVerifyView.as_view(), name="voter-verify"),
    path("voters/verify-all/", VoterVerifyAllView.as_view(), name="voter-verify-all"),
    path("voters/<int:pk>/deactivate/", VoterDeactivateView.as_view(), name="voter-deactivate"),
    path("admins/", AdminListView.as_view(), name="admin-list"),
    path("admins/create/", AdminCreateView.as_view(), name="admin-create"),
    path("admins/<int:pk>/deactivate/", AdminDeactivateView.as_view(), name="admin-deactivate"),
]
