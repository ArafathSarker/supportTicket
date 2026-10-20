"""
WebSocket routes for the component. Include them in the host's ASGI app::

    # config/asgi.py
    from channels.routing import ProtocolTypeRouter, URLRouter
    from django.core.asgi import get_asgi_application
    from support_ticket.middleware import DemoUserMiddlewareStack
    from support_ticket.routing import websocket_urlpatterns

    application = ProtocolTypeRouter({
        'http': get_asgi_application(),
        'websocket': DemoUserMiddlewareStack(URLRouter(websocket_urlpatterns)),
    })
"""
from django.urls import re_path

from .consumers import TicketChatConsumer

websocket_urlpatterns = [
    re_path(r'^ws/tickets/(?P<ticket_id>\d+)/chat/$', TicketChatConsumer.as_asgi()),
]
