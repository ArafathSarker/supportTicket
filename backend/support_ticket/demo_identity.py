"""Demo-only WebSocket identity resolver."""
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser


@database_sync_to_async
def get_demo_user(username):
    return (
        get_user_model()
        .objects.filter(username=username or 'superadmin', is_active=True)
        .first()
        or AnonymousUser()
    )
