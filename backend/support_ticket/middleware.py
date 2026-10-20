"""
Channels middleware that authenticates WebSocket connections with a JWT
passed as ?token=<access_token> query parameter. Uses the host project's
AUTH_USER_MODEL, so it works with any custom user.
"""
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken


@database_sync_to_async
def get_user(user_id):
    from django.contrib.auth import get_user_model

    try:
        return get_user_model().objects.get(pk=user_id)
    except get_user_model().DoesNotExist:
        return AnonymousUser()


class JWTAuthMiddleware(BaseMiddleware):
    """Authenticates the websocket connection with ?token=<jwt>."""

    async def __call__(self, scope, receive, send):
        query = parse_qs(scope.get('query_string', b'').decode('utf-8'))
        token = (query.get('token') or [None])[0]

        scope['user'] = AnonymousUser()
        if token:
            try:
                access = AccessToken(token)
                scope['user'] = await get_user(access['user_id'])
            except (InvalidToken, TokenError, KeyError):
                pass
        return await super().__call__(scope, receive, send)


def JWTAuthMiddlewareStack(inner):
    """Convenience wrapper with the conventional Channels naming."""
    return JWTAuthMiddleware(inner)
