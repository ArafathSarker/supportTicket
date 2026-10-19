from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_health(request):
    if request.path == '/':
        return JsonResponse({
            'name': 'IoT Support Ticket API',
            'status': 'ok',
            'endpoints': {
                'api': '/api/',
                'tickets': '/api/tickets/',
                'visiting_logs': '/api/visiting-logs/',
                'options': '/api/options/',
                'login': '/api/accounts/auth/token/',
                'admin': '/admin/',
            },
            'frontend': 'http://localhost:5173',
        })
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('', api_health, name='root'),
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('tickets.urls')),
    path('api/', include('visits.urls')),
    path('api/health/', api_health, name='api-health'),
]
