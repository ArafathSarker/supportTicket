from django.conf import settings
from django.db import models

from .conf import company_model_label


class DynamicOption(models.Model):
    """
    Generic dynamic dropdown configuration.

    Any dropdown that must be configurable at runtime (affected systems,
    problem categories, work-performed checklist items) is stored here —
    add a value for a key in the admin and it is instantly selectable in
    the frontend, no redeploy.
    """

    SYSTEM_KEY = 'system'
    CATEGORY_KEY = 'category'
    WORK_PERFORMED_KEY = 'work_performed'

    KEY_CHOICES = [
        (SYSTEM_KEY, 'Affected system'),
        (CATEGORY_KEY, 'Problem category'),
        (WORK_PERFORMED_KEY, 'Work performed checklist item'),
    ]

    key = models.CharField(max_length=64, choices=KEY_CHOICES, db_index=True)
    label = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('key', 'label')
        ordering = ['key', 'label']

    def __str__(self):
        return f'{self.key}: {self.label}'

    @classmethod
    def for_key(cls, key: str):
        return cls.objects.filter(key=key, is_active=True).order_by('label')


class Ticket(models.Model):
    """Support ticket raised by a company user to the super admin."""

    class Status(models.TextChoices):
        OPEN = 'open', 'Open'
        IN_PROGRESS = 'in_progress', 'In progress'
        RESOLVED = 'resolved', 'Resolved'
        CLOSED = 'closed', 'Closed'

    class Urgency(models.TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        CRITICAL = 'critical', 'Critical'

    Priority = Urgency  # same fixed levels

    company = models.ForeignKey(
        settings.SUPPORT_TICKET_COMPANY_MODEL,
        on_delete=models.CASCADE,
        related_name='support_tickets',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_tickets'
    )

    title = models.CharField(max_length=255, help_text='Problem summary')
    sensor_id = models.CharField(max_length=255, help_text='Sensor ID / asset tag')
    factory_section = models.CharField(max_length=255, help_text='Factory section / location')
    affected_system = models.CharField(max_length=255)
    problem_category = models.CharField(max_length=255)
    urgency = models.CharField(max_length=16, choices=Urgency.choices, default=Urgency.LOW)
    priority = models.CharField(max_length=16, choices=Priority.choices, default=Priority.MEDIUM)
    description = models.TextField(help_text='Describe the problem in detail')

    status = models.CharField(
        max_length=16, choices=Status.choices, default=Status.OPEN, db_index=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        permissions = [('view_all_tickets', 'Can view tickets of every company')]

    def __str__(self):
        return f'#{self.pk} {self.title}'


def attachment_upload_to(instance, filename):
    return f'support/tickets/{instance.ticket_id}/{filename}'


class TicketAttachment(models.Model):
    """Image / video / document attached to a ticket, stored on S3-compatible storage."""

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=attachment_upload_to)

    file_type = models.CharField(max_length=16, blank=True)
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return str(self.file)


class TicketMessage(models.Model):
    """Direct live-chat message between the company user and the super admin."""

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='support_ticket_messages'
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender}: {self.content[:30]}'


class VisitingLog(models.Model):
    """
    Site visit created by the super admin after handling a ticket.

    Acts as the acknowledgement the company receives, and doubles as a
    visiting report they can review in the visiting-report screen.
    """

    ticket = models.ForeignKey(
        Ticket,
        on_delete=models.CASCADE,
        related_name='visiting_logs',
        null=True,
        blank=True,
        help_text='Ticket being acknowledged / followed up by this visit.',
    )
    company = models.ForeignKey(
        settings.SUPPORT_TICKET_COMPANY_MODEL,
        on_delete=models.CASCADE,
        related_name='visiting_logs',
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='visiting_logs'
    )

    visiting_date = models.DateField()
    number_of_persons = models.PositiveSmallIntegerField(default=1)
    responsible_phone_numbers = models.CharField(
        max_length=255,
        help_text='Comma separated phone numbers of responsible contacts.',
    )
    reason = models.TextField()
    work_performed = models.JSONField(
        default=list,
        help_text='Checklist of performed work items (labels).',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-visiting_date']

    def __str__(self):
        return f'Visit {self.pk} – {self.company} on {self.visiting_date}'
