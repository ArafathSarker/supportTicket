"""
ASGI entrypoint: serves both HTTP and WebSocket protocols.

- HTTP  -> Django (uvicorn)
- WS    -> Django Channels (support_ticket chat consumers)

Host projects copy this same wiring — the component exposes
``support_ticket.routing`` and ``support_ticket.middleware``.
"""
import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

django_asgi_app = get_asgi_application()

from support_ticket import routing  # noqa: E402  (must import after django setup)
from support_ticket.middleware import JWTAuthMiddlewareStack  # noqa: E402

application = ProtocolTypeRouter({
    'http': django_asgi_app,
    'websocket': JWTAuthMiddlewareStack(
        URLRouter(routing.websocket_urlpatterns)
    ),
})
