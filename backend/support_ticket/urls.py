"""
All component URL routes. The host mounts them wherever it likes::

    # config/urls.py
    path('api/', include('support_ticket.urls')),

Resulting endpoints (relative to the mount point, e.g. /api/):

    GET  tickets/                     role-scoped, paginated (?status=&urgency=&priority=&search=&company=)
    POST tickets/                     company user create (multipart ok: file + file_type)
    GET  tickets/<id>/                retrieve
    PATCH tickets/<id>/               status change (super admin)
    GET  tickets/<id>/messages/       chat history (flat list)
    POST tickets/<id>/messages/       add chat message
    GET  tickets/<id>/attachments/    attachment list (storage URLs)
    POST tickets/<id>/attachments/    upload attachment
    GET  visiting-logs/               role-scoped, paginated
    POST visiting-logs/               super admin acknowledgement
    GET/PUT/PATCH/DELETE visiting-logs/<id>/
    GET  options/                     dynamic dropdown values grouped by key
    GET  companies/                   company dropdown (role-scoped)
"""
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    CompanyListView,
    DynamicOptionsView,
    TicketAttachmentListCreateView,
    TicketMessageListCreateView,
    TicketViewSet,
    VisitingLogDetailView,
    VisitingLogListCreateView,
)

router = DefaultRouter()
router.register('tickets', TicketViewSet, basename='ticket')

urlpatterns = [
    path('options/', DynamicOptionsView.as_view(), name='support-options'),
    path('companies/', CompanyListView.as_view(), name='support-companies'),
    path(
        'tickets/<int:ticket_id>/messages/',
        TicketMessageListCreateView.as_view(),
        name='support-ticket-messages',
    ),
    path(
        'tickets/<int:ticket_id>/attachments/',
        TicketAttachmentListCreateView.as_view(),
        name='support-ticket-attachments',
    ),
    *router.urls,
    path(
        'visiting-logs/',
        VisitingLogListCreateView.as_view(),
        name='support-visiting-logs',
    ),
    path(
        'visiting-logs/<int:pk>/',
        VisitingLogDetailView.as_view(),
        name='support-visiting-log-detail',
    ),
]
