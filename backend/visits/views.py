from rest_framework import generics, permissions

from tickets.permissions import IsSuperAdmin, is_super_admin
from .models import VisitingLog
from .serializers import VisitingLogSerializer


class VisitingLogListCreateView(generics.ListCreateAPIView):
    """
    /api/visiting-logs/

    GET  — company admin: reports for own company; super admin: all (?company=).
    POST — super admin only (the acknowledgement workflow).
    """

    serializer_class = VisitingLogSerializer

    def get_queryset(self):
        qs = VisitingLog.objects.select_related('company', 'ticket', 'created_by')
        if not is_super_admin(self.request.user):
            qs = qs.filter(company_id=self.request.user.profile.company_id)
        else:
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
        user = self.request.user
        company = None
        from accounts.models import Profile
        role = getattr(getattr(user, 'profile', None), 'role', '')
        if role == Profile.ROLE_COMPANY_ADMIN:
            company = user.profile.company
        serializer.save(created_by=user, company=company or serializer.validated_data.get('company'))


class VisitingLogDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = VisitingLog.objects.all()
    serializer_class = VisitingLogSerializer

    def get_permissions(self):
        if self.request.method in ('PUT', 'PATCH', 'DELETE'):
            return [permissions.IsAuthenticated(), IsSuperAdmin()]
        return [permissions.IsAuthenticated()]
