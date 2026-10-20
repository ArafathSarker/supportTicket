from django.urls import path
from .views import CompanyListView, MeView


urlpatterns = [
    path('me/', MeView.as_view(), name='me'),
    path('companies/', CompanyListView.as_view(), name='companies'),
]
