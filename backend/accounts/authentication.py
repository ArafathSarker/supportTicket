"""Demo-only identity selection without credential authentication."""
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication


class DemoUserAuthentication(BaseAuthentication):
    """Resolve one seeded user from X-Demo-User; default to superadmin."""

    def authenticate(self, request):
        username = request.headers.get('X-Demo-User', 'superadmin')
        user = get_user_model().objects.filter(username=username, is_active=True).first()
        if user is None:
            return None
        return user, None
