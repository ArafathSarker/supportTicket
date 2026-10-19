from rest_framework import serializers

from tickets.permissions import is_super_admin
from .models import VisitingLog


class VisitingLogSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    ticket_title = serializers.CharField(source='ticket.title', read_only=True, allow_null=True)

    class Meta:
        model = VisitingLog
        fields = [
            'id', 'ticket', 'ticket_title', 'company', 'company_name',
            'created_by', 'created_by_username',
            'visiting_date', 'number_of_persons',
            'responsible_phone_numbers', 'reason',
            'work_performed', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def validate_company(self, value):
        user = self.context['request'].user
        from accounts.models import Profile
        profile_role = getattr(getattr(user, 'profile', None), 'role', '')
        if profile_role == Profile.ROLE_COMPANY_ADMIN and user.profile.company_id != value.id:
            raise serializers.ValidationError('You can only log visits for your own company.')
        return value

    def validate_work_performed(self, value):
        if not isinstance(value, list) or not all(isinstance(i, str) for i in value):
            raise serializers.ValidationError('work_performed must be a list of strings.')
        return value


class ReadOnlyCompanyAdmin(VisitingLogSerializer.Meta):
    pass
