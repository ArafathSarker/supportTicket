from django.contrib.auth.models import User
from django.db import models


class Company(models.Model):
    """Company (client) that submits support tickets."""

    name = models.CharField(max_length=255, unique=True)
    contact_email = models.EmailField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Profile(models.Model):
    """Extends the default User with an app role + company membership."""

    ROLE_SUPER_ADMIN = 'super_admin'
    ROLE_COMPANY_ADMIN = 'company_admin'
    ROLE_CHOICES = [
        (ROLE_SUPER_ADMIN, 'Super admin'),
        (ROLE_COMPANY_ADMIN, 'Company admin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=32, choices=ROLE_CHOICES)
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='members',
        help_text='Required for company admins, null for super admins.',
    )

    def __str__(self):
        return f'{self.user.username} ({self.role})'
