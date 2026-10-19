import mimetypes

from rest_framework import serializers

from .models import Ticket, TicketAttachment, TicketMessage


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

    company_name = serializers.CharField(source='company.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
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
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_role = serializers.SerializerMethodField()

    def get_sender_role(self, obj):
        return getattr(getattr(obj.sender, 'profile', None), 'role', '')

    class Meta:
        model = TicketMessage
        fields = ['id', 'ticket', 'sender', 'sender_username', 'sender_role', 'content', 'created_at']
        read_only_fields = ['id', 'ticket', 'sender']
