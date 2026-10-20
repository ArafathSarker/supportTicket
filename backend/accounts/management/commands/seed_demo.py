"""Seed demo companies, users (with roles) and dynamic dropdown options."""
import os

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from accounts.models import Company, Profile
from support_ticket.models import DynamicOption


DEMO = {
    'systems': ['Greenhouse Controller', 'Weather Station', 'Soil Moisture Probes', 'Irrigation Gateway', 'Cold Storage Monitor'],
    'categories': ['Hardware failure', 'Connectivity loss', 'Sensor drift', 'Firmware update', 'Data not reporting'],
    'work_performed': ['Firmware upgrade', 'Sensor replacement', 'Network troubleshooting', 'Calibration', 'Preventive maintenance', 'Wiring repair'],
}


class Command(BaseCommand):
    help = 'Seed demo companies, admin/super-admin users and dynamic options.'

    def handle(self, *args, **options):
        # --- companies -----------------------------------------------------
        alpha, _ = Company.objects.get_or_create(
            name='Alpha IoT Farms', defaults={'contact_email': 'ops@alphaiot.example'}
        )
        beta, _ = Company.objects.get_or_create(
            name='GreenLeaf Cold Chain', defaults={'contact_email': 'support@greenleaf.example'}
        )

        # --- super admin ---------------------------------------------------
        sa, created = User.objects.get_or_create(username='superadmin')
        if created:
            sa.is_staff = True
            sa.is_superuser = True
            sa.set_password(os.getenv('SUPERADMIN_PASSWORD', 'SuperAdmin#123'))
            sa.save()
            Profile.objects.create(user=sa, role=Profile.ROLE_SUPER_ADMIN)
            self.stdout.write('Created super admin: superadmin')

        # --- company admins --------------------------------------------------
        for company, username in ((alpha, 'alpha_admin'), (beta, 'greenleaf_admin')):
            user, created = User.objects.get_or_create(username=username)
            if created:
                user.is_staff = True
                user.set_password(os.getenv('COMPANYADMIN_PASSWORD', 'CompanyAdmin#123'))
                user.save()
                Profile.objects.create(
                    user=user, role=Profile.ROLE_COMPANY_ADMIN, company=company
                )
                self.stdout.write(f'Created company admin: {username} ({company.name})')

        # --- dynamic options ---------------------------------------------------
        self.seed_options(DynamicOption.SYSTEM_KEY, DEMO['systems'])
        self.seed_options(DynamicOption.CATEGORY_KEY, DEMO['categories'])
        self.seed_options(DynamicOption.WORK_PERFORMED_KEY, DEMO['work_performed'])

        self.stdout.write(self.style.SUCCESS('Seed complete. Allocate role via /admin -> Profiles for other users.'))

    def seed_options(self, key, labels):
        for label in labels:
            DynamicOption.objects.get_or_create(key=key, label=label)
        self.stdout.write(f'Seeded options for key={key}')
