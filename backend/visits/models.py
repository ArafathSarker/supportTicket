from django.contrib.auth.models import User
from django.db import models


class VisitingLog(models.Model):
    """
    Site visit created by the super admin after handling a ticket.

    Acts as the acknowledgement the company receives, and doubles as a
    visiting report they can review in /visiting-report.
    """

    ticket = models.ForeignKey(
        'tickets.Ticket',
        on_delete=models.CASCADE,
        related_name='visiting_logs',
        null=True,
        blank=True,
        help_text='Ticket being acknowledged / followed up by this visit.',
    )
    company = models.ForeignKey(
        'accounts.Company', on_delete=models.CASCADE, related_name='visiting_logs'
    )
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visiting_logs')

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
