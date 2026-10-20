from django.db.models import Q

from rest_framework import generics, permissions, serializers, viewsets
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from . import conf
from .models import DynamicOption, Ticket, TicketAttachment, TicketMessage, VisitingLog
from .pagination import SupportPagination
from .permissions import IsCompanyAdmin, IsSuperAdmin
from .serializers import (
    DefaultCompanySerializer,
    TicketAttachmentSerializer,
    TicketCreateSerializer,
    TicketMessageSerializer,
    TicketSerializer,
    TicketStatusUpdateSerializer,
    VisitingLogSerializer,
    guess_file_type,
)


def companies_qs(user):
    """Role-scoped company queryset for dropdowns (all vs own)."""
    model = conf.company_model()
    if conf.is_super_admin(user):
        return model.objects.all()
    own = conf.user_company(user)
    if own is None:
        return model.objects.none()
    return model.objects.filter(pk=own.pk)


def accessible_ticket_qs(user):
    """Return only tickets the current role is allowed to inspect."""
    qs = Ticket.objects.all()
    if conf.is_super_admin(user):
        return qs
    company = conf.user_company(user)
    return qs.filter(company=company) if company is not None else qs.none()


class CompanyListView(generics.ListAPIView):
    """GET companies/ — dropdown source for forms (role-scoped)."""

    pagination_class = None
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        override = conf.company_serializer_class()
        return override or DefaultCompanySerializer

    def get_queryset(self):
        return companies_qs(self.request.user)


class DynamicOptionsView(generics.ListAPIView):
    """GET options/ — dynamic dropdown values, grouped by key."""

    class OutputSerializer(serializers.Serializer):
        key = serializers.CharField()
        label = serializers.CharField()

    permission_classes = [permissions.IsAuthenticated]

    def list(self, request, *args, **kwargs):
        grouped = {}
        for opt in DynamicOption.objects.filter(is_active=True).values('key', 'label'):
            grouped.setdefault(opt['key'], []).append(opt['label'])
        return Response(grouped)


class TicketViewSet(viewsets.ModelViewSet):
    """
    tickets/

    GET    list   — super admin: all tickets; company user: own company only.
    POST   create — company user creates a ticket (+ optional media file).
    GET    retrieve one.
    PATCH  update status (super admin).
    """

    pagination_class = SupportPagination

    def get_queryset(self):
        qs = Ticket.objects.select_related('company', 'created_by').prefetch_related('attachments')
        params = self.request.query_params

        if not conf.is_super_admin(self.request.user):
            company = conf.user_company(self.request.user)
            qs = Ticket.objects.none() if company is None else qs.filter(company=company)
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
        if self.action in ('update', 'partial_update'):
            return TicketStatusUpdateSerializer
        return TicketSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.IsAuthenticated(), IsCompanyAdmin()]
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(
            company=conf.user_company(self.request.user),
            created_by=self.request.user,
        )

    def create(self, request, *args, **kwargs):
        """Create and respond with the full read representation (id, company…)."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        read = TicketSerializer(serializer.instance, context=self.get_serializer_context())
        return Response(read.data, status=201)


class TicketMessageListCreateView(generics.ListCreateAPIView):
    """Chat history for one ticket; new messages also broadcast over WebSocket."""

    serializer_class = TicketMessageSerializer
    pagination_class = None  # chat history must render as a flat array
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not accessible_ticket_qs(self.request.user).filter(
            pk=self.kwargs['ticket_id']
        ).exists():
            raise NotFound('Ticket not found.')
        return TicketMessage.objects.filter(
            ticket_id=self.kwargs['ticket_id']
        ).select_related('sender')

    def perform_create(self, serializer):
        self.get_queryset()
        serializer.save(sender=self.request.user, ticket_id=self.kwargs['ticket_id'])


class TicketAttachmentListCreateView(generics.ListCreateAPIView):
    """Attachments for one ticket — uploaded files land on the configured storage."""

    serializer_class = TicketAttachmentSerializer
    pagination_class = None
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if not accessible_ticket_qs(self.request.user).filter(
            pk=self.kwargs['ticket_id']
        ).exists():
            raise NotFound('Ticket not found.')
        return TicketAttachment.objects.filter(ticket_id=self.kwargs['ticket_id'])

    def perform_create(self, serializer):
        self.get_queryset()
        upload = self.request.FILES.get('file')
        serializer.save(
            ticket_id=self.kwargs['ticket_id'],
            uploaded_by=self.request.user,
            file_type=guess_file_type(upload.name if upload else ''),
        )


class VisitingLogListCreateView(generics.ListCreateAPIView):
    """
    visiting-logs/

    GET  — company user: reports for own company; super admin: all (?company=).
    POST — super admin only (the acknowledgement workflow).
    """

    serializer_class = VisitingLogSerializer
    pagination_class = SupportPagination

    def get_queryset(self):
        qs = VisitingLog.objects.select_related('company', 'ticket', 'created_by')
        if not conf.is_super_admin(self.request.user):
            company = conf.user_company(self.request.user)
            qs = VisitingLog.objects.none() if company is None else qs.filter(company=company)
        if self.request.user.is_authenticated and conf.is_super_admin(self.request.user):
            company_id = self.request.query_params.get('company')
            if company_id:
                qs = qs.filter(company_id=company_id)
        ticket_id = self.request.query_params.get('ticket')
        if ticket_id:
            qs = qs.filter(ticket_id=ticket_id)
        return qs

    def get_permissions(self):
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        own_company = conf.user_company(self.request.user) if conf.is_company_admin(self.request.user) else None
        serializer.save(
            created_by=self.request.user,
            company=own_company or serializer.validated_data.get('company'),
        )


class VisitingLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = VisitingLogSerializer
    pagination_class = SupportPagination

    def get_queryset(self):
        qs = VisitingLog.objects.select_related('company', 'ticket', 'created_by')
        if conf.is_super_admin(self.request.user):
            return qs
        company = conf.user_company(self.request.user)
        return qs.filter(company=company) if company is not None else qs.none()

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return [permissions.IsAuthenticated()]
