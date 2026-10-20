"""
Component configuration — every default is overridable by the host project.

Hosts set a single dict in settings::

    SUPPORT_TICKET = {
        'COMPANY_MODEL': 'myapp.Organization',   # company/user-org model label
        'ROLE_RESOLVER': 'myapp.support.resolve_role',
        'COMPANY_RESOLVER': 'myapp.support.resolve_company',
        'PAGE_SIZE': 10,
    }

Nothing outside this module reads raw ``SUPPORT_TICKET`` values, so the host
can also nest extra keys (e.g. storage credentials) here.
"""
from django.conf import settings
from django.utils.module_loading import import_string

from .hooks import (
    ROLE_COMPANY_ADMIN,
    ROLE_SUPER_ADMIN,
    default_company_resolver,
    default_role_resolver,
)

DEFAULTS = {
    # Related company/organization model as '<app_label>.<ModelName>'.
    # Required for ticket creation & company scoping; None disables that side.
    'COMPANY_MODEL': None,
    # Dotted paths to: (user) -> 'super_admin' | 'company_admin' | ''
    'ROLE_RESOLVER': 'support_ticket.hooks.default_role_resolver',
    # Dotted path to: (user) -> related-company instance or None
    'COMPANY_RESOLVER': 'support_ticket.hooks.default_company_resolver',
    # Optional dotted path to a DRF Serializer used by GET /companies/
    'COMPANY_SERIALIZER': None,
    # Server-side page size for every list endpoint in this component.
    'PAGE_SIZE': 10,
}

__all__ = [
    'ROLE_SUPER_ADMIN',
    'ROLE_COMPANY_ADMIN',
    'setting',
    'company_model',
    'resolve_role',
    'is_super_admin',
    'is_company_admin',
    'user_company',
    'company_serializer_class',
]


def setting(name, default=None):
    """Merged value for a SUPPORT_TICKET key (host dict > built-in default > arg)."""
    host = dict(DEFAULTS)
    host.update(getattr(settings, 'SUPPORT_TICKET', {}) or {})
    return host.get(name, default)


def company_model_label():
    """The related company model as '<app_label>.<ModelName>'."""
    # Keep the model label as a normal Django setting so the app migration can
    # declare a swappable dependency instead of depending on a demo app.
    label = getattr(settings, 'SUPPORT_TICKET_COMPANY_MODEL', None) or setting(
        'COMPANY_MODEL'
    )
    if not label:
        from django.core.exceptions import ImproperlyConfigured

        raise ImproperlyConfigured(
            "support_ticket needs a company model. Set SUPPORT_TICKET = "
            "{'COMPANY_MODEL': 'app_label.ModelName', ...} in your settings "
            "and run migrations. Company-scoped features (ticket creation, "
            "company scoping) are unavailable without it."
        )
    return label


def company_model():
    """The related company model class."""
    from django.apps import apps

    return apps.get_model(company_model_label())


def resolve_role(user) -> str:
    """Role for a user via the configured resolver: super_admin|company_admin|''."""
    if user is None or not getattr(user, 'is_authenticated', False):
        return ''
    return import_string(setting('ROLE_RESOLVER'))(user)


def is_super_admin(user) -> bool:
    return resolve_role(user) == ROLE_SUPER_ADMIN


def is_company_admin(user) -> bool:
    return resolve_role(user) == ROLE_COMPANY_ADMIN


def user_company(user):
    """The company instance a user belongs to (None for super admins typically)."""
    return import_string(setting('COMPANY_RESOLVER'))(user)


def company_serializer_class():
    """Serializer used for the company dropdown; falls back to a generic one."""
    override = setting('COMPANY_SERIALIZER')
    return import_string(override) if override else None
