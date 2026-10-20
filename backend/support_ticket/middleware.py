"""Channels middleware for the unauthenticated demo identity selector."""
from urllib.parse import parse_qs

from channels.middleware import BaseMiddleware
from .demo_identity import get_demo_user


class DemoUserMiddleware(BaseMiddleware):
    """Selects a seeded user with ?user=; defaults to superadmin."""

    async def __call__(self, scope, receive, send):
        query = parse_qs(scope.get('query_string', b'').decode('utf-8'))
        scope['user'] = await get_demo_user((query.get('user') or ['superadmin'])[0])
        return await super().__call__(scope, receive, send)


def DemoUserMiddlewareStack(inner):
    return DemoUserMiddleware(inner)
