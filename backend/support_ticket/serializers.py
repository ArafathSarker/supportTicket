import mimetypes

from rest_framework import serializers

from . import conf
from .models import Ticket, TicketAttachment, TicketMessage, VisitingLog


def guess_file_type(name: str) -> str:
    mime, _ = mimetypes.guess_type(name or '')
    if mime:
        if mime.startswith('image/'):
            return 'image'
        if mime.startswith('video/'):
            return 'video'
    return 'other'


class TicketSerializer(serializers.ModelSerializer):
    """Read serializer — used in list & detail responses."""

    # Rendered via str(company) so any host company model works.
    company_name = serializers.CharField(source='company', read_only=True)
    created_by_username = serializers.CharField(
        source='created_by.get_username', read_only=True
    )
    attachment_count = serializers.SerializerMethodField()

    def get_attachment_count(self, obj):
        return obj.attachments.count()

    class Meta:
        model = Ticket
        fields = [
            'id', 'company', 'company_name', 'created_by', 'created_by_username',
            'title', 'affected_system', 'problem_category',
            'urgency', 'priority', 'description', 'status',
            'attachment_count', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'company', 'created_by', 'status']


class TicketCreateSerializer(serializers.ModelSerializer):
    """Create serializer — validates form fields and optional media upload."""

    file = serializers.FileField(required=False, write_only=True)
    file_type = serializers.ChoiceField(
        choices=['image', 'video', 'other'],
        required=False,
        write_only=True,
    )

    class Meta:
        model = Ticket
        fields = [
            'title', 'affected_system', 'problem_category',
            'urgency', 'priority', 'description', 'file', 'file_type',
        ]

    def validate(self, attrs):
        if attrs.get('file_type') and not attrs.get('file'):
            raise serializers.ValidationError('file_type requires file')
        return attrs

    def create(self, validated_data):
        upload = validated_data.pop('file', None)
        upload_type = validated_data.pop('file_type', None)
        ticket = Ticket.objects.create(**validated_data)
        if upload:
            TicketAttachment.objects.create(
                ticket=ticket,
                file=upload,
                file_type=upload_type or guess_file_type(upload.name),
                uploaded_by=validated_data['created_by'],
            )
        return ticket


class TicketStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ticket
        fields = ['status']


class TicketAttachmentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    def get_file_url(self, obj):
        try:
            return obj.file.url
        except ValueError:
            return None

    class Meta:
        model = TicketAttachment
        fields = ['id', 'file', 'file_url', 'file_type', 'uploaded_by', 'uploaded_at']


class TicketMessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.get_username', read_only=True)
    sender_role = serializers.SerializerMethodField()

    def get_sender_role(self, obj):
        return conf.resolve_role(obj.sender)

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_username', 'sender_role', 'content', 'created_at']
        read_only_fields = ['id', 'ticket', 'sender']


class VisitingLogSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='company', read_only=True)
    created_by_username = serializers.CharField(
        source='created_by.get_username', read_only=True
    )
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
        """Company users may only log visits for their own company."""
        user = self.context['request'].user
        if conf.is_company_admin(user):
            own = conf.user_company(user)
            if own is None or own.pk != value.pk:
                raise serializers.ValidationError('You can only log visits for your own company.')
        return value

    def validate_work_performed(self, value):
        if not isinstance(value, list) or not all(isinstance(i, str) for i in value):
            raise serializers.ValidationError('work_performed must be a list of strings.')
        return value


class DefaultCompanySerializer(serializers.Serializer):
    """Id/label pair for any host company model (overridable per conf)."""

    id = serializers.IntegerField(read_only=True)
    label = serializers.SerializerMethodField()

    def get_label(self, obj):
        return str(obj)
