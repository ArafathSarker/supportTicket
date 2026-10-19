from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    DynamicOptionsView,
    TicketAttachmentListCreateView,
    TicketMessageListCreateView,
    TicketViewSet,
)

router = DefaultRouter()
router.register('tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('options/', DynamicOptionsView.as_view(), name='dynamic-options'),
    path(
        'tickets/<int:ticket_id>/messages/',
        TicketMessageListCreateView.as_view(),
        name='ticket-messages',
    ),
    path(
        'tickets/<int:ticket_id>/attachments/',
        TicketAttachmentListCreateView.as_view(),
        name='ticket-attachments',
    ),
    *router.urls,
]
