"""
Custom Channels auth middleware that accepts a JWT via token query param.

WS URL: /ws/tickets/<id>/chat/?token=<access_token>
"""
from urllib.parse import parse_qs

from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework_simplejwt.tokens import AccessToken


@database_sync_to_async
def get_user(user_id):
    from django.contrib.auth.models import User
    try:
        return User.objects.get(pk=user_id)
    except User.DoesNotExist:
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
    return JWTAuthMiddleware(inner)
