from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def api_health(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    path('api/', include('tickets.urls')),
    path('api/', include('visits.urls')),
    path('api/health/', api_health, name='api-health'),
]
