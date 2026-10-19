from django.contrib.auth.models import User
from django.db import models


class Ticket(models.Model):
    """Support ticket raised by a company admin to the super admin."""

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
        'accounts.Company', on_delete=models.CASCADE, related_name='tickets'
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets')

    title = models.CharField(max_length=255, help_text='Problem summary')
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
    return f'tickets/{instance.ticket_id}/{filename}'


class TicketAttachment(models.Model):
    """Image / video / document attached to a ticket, stored on S3 (Supabase)."""

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=attachment_upload_to)

    file_type = models.CharField(max_length=16, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['uploaded_at']

    def __str__(self):
        return str(self.file)


class TicketMessage(models.Model):
    """Direct live-chat message between company admin and super admin."""

    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ticket_messages')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.sender.username}: {self.content[:30]}'
