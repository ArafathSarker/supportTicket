"""
Root URL configuration — demo wiring.

Host projects reuse the endpoint block below verbatim; the support_ticket
component mounts all of its routes from a single include().
"""
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_health(request):
    """Liveness probe + endpoint map."""
    return JsonResponse({
        'name': 'Support Ticket API',
        'status': 'ok',
        'component': 'support_ticket',
        'endpoints': {
            'component_base': '/api/',
            'tickets': '/api/tickets/',
            'visiting_logs': '/api/visiting-logs/',
            'options': '/api/options/',
            'companies': '/api/companies/',
            'websocket_chat': '/ws/tickets/<id>/chat/',
            'login': '/api/accounts/auth/token/',
            'admin': '/admin/',
        },
    })


urlpatterns = [
    path('', api_health, name='root'),
    path('admin/', admin.site.urls),

    # Demo-only auth (JWT login/refresh). Hosts wire up their own auth instead.
    path('api/accounts/', include('accounts.urls')),

    # ★ the support_ticket component — every endpoint mounts from here
    path('api/', include('support_ticket.urls')),

    path('api/health/', api_health, name='api-health'),
]
