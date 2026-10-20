"""
Demo wiring between this project's accounts app and the support_ticket component.

The component never imports accounts — it calls the resolvers registered in
config/settings.py (SUPPORT_TICKET_ROLE_RESOLVER / COMPANY_RESOLVER). Any host
project can point them at its own user-profile machinery the same way.
"""
from support_ticket.hooks import ROLE_SUPER_ADMIN


def resolve_role(user) -> str:
    """Role from the demo Profile model; Django superusers are always super admin."""
    role = getattr(getattr(user, 'profile', None), 'role', '')
    if user.is_superuser and not role:
        return ROLE_SUPER_ADMIN
    return role


def resolve_company(user):
    """The demo Profile's company (None for super admins)."""
    return getattr(getattr(user, 'profile', None), 'company', None)
