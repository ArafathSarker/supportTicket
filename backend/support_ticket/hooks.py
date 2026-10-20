"""
Default pluggable hooks + the role/company vocabulary.

Host projects override them through SUPPORT_TICKET['ROLE_RESOLVER'] /
SUPPORT_TICKET['COMPANY_RESOLVER'] (dotted paths returning the same shapes),
keeping this app free of any import from the host's own apps.
"""

ROLE_SUPER_ADMIN = 'super_admin'
ROLE_COMPANY_ADMIN = 'company_admin'


def default_role_resolver(user) -> str:
    """Superusers manage everything; any other authenticated user is a client."""
    if getattr(user, 'is_superuser', False):
        return ROLE_SUPER_ADMIN
    if getattr(user, 'is_authenticated', False):
        return ROLE_COMPANY_ADMIN
    return ''


def default_company_resolver(user):
    """Without a host hook there is no company membership to resolve."""
    return None
