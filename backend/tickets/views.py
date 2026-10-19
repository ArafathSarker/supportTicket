import mimetypes

from django.db.models import Q
from rest_framework import generics, permissions, serializers, viewsets
from rest_framework.response import Response

from core.models import DynamicOption

from .models import Ticket, TicketAttachment
from .permissions import IsCompanyAdmin, IsSuperAdmin, is_super_admin, user_role
from .serializers import (
    TicketAttachmentSerializer,
    TicketCreateSerializer,
    TicketMessageSerializer,
    TicketSerializer,
    TicketStatusUpdateSerializer,
    guess_file_type,
)


class TicketViewSet(viewsets.ModelViewSet):
    """
    /api/tickets/

    GET    list   — super admin: all tickets; company admin: own company only.
    POST   create — company admin creates a ticket (+ optional media file).
    GET    retrieve one.
    PATCH  update status (super admin).
    """

    def get_queryset(self):
        qs = Ticket.objects.select_related('company', 'created_by').prefetch_related('attachments')
        params = self.request.query_params

        if not is_super_admin(self.request.user):
            qs = qs.filter(company_id=self.request.user.profile.company_id)
        else:
            company_id = params.get('company')
            if company_id:
                qs = qs.filter(company_id=company_id)

        ticket_status = params.get('status')
        if ticket_status:
            qs = qs.filter(status=ticket_status)
        urgency = params.get('urgency')
        if urgency:
            qs = qs.filter(urgency=urgency)
        priority = params.get('priority')
        if priority:
            qs = qs.filter(priority=priority)
        search = params.get('search')
        if search:
            qs = qs.filter(Q(title__icontains=search) | Q(description__icontains=search))
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return TicketCreateSerializer
        return TicketSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsCompanyAdmin()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        company = self.request.user.profile.company
        serializer.save(
            company=company,
            created_by=self.request.user,
        )


class TicketMessageListCreateView(generics.ListCreateAPIView):
    """Chat history for one ticket; new messages also go out over WebSocket."""

    serializer_class = TicketMessageSerializer

    def get_queryset(self):
        return (
            TicketMessage.objects.filter(ticket_id=self.kwargs['ticket_id'])
            .select_related('sender')
        )

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user, ticket_id=self.kwargs['ticket_id'])


class TicketAttachmentListCreateView(generics.ListCreateAPIView):
    serializer_class = TicketAttachmentSerializer

    def get_queryset(self):
        return TicketAttachment.objects.filter(ticket_id=self.kwargs['ticket_id'])

    def perform_create(self, serializer):
        upload = self.request.FILES.get('file')
        serializer.save(
            ticket_id=self.kwargs['ticket_id'],
            uploaded_by=self.request.user,
            file_type=guess_file_type(upload.name if upload else ''),
        )


class DynamicOptionsView(generics.ListAPIView):
    """Dynamic dropdown values, grouped by key for easy frontend consumption."""

    class OutputSerializer(serializers.Serializer):
        key = serializers.CharField()
        label = serializers.CharField()

    def get_options(self):
        return (
            DynamicOption.objects.filter(is_active=True)
            .values('key', 'label')
        )

    def list(self, request, *args, **kwargs):
        grouped = {}
        for opt in self.get_options():
            grouped.setdefault(opt['key'], []).append(opt['label'])
        return Response(grouped)
