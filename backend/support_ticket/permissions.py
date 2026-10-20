"""DRF permission classes built on the pluggable hooks."""
from rest_framework.permissions import BasePermission

from . import conf


class IsSuperAdmin(BasePermission):
    message = 'Only super admins can perform this action.'

    def has_permission(self, request, view):
        return conf.is_super_admin(request.user)


class IsCompanyAdmin(BasePermission):
    message = 'Only company users can perform this action.'

    def has_permission(self, request, view):
        return conf.is_company_admin(request.user) and conf.user_company(request.user) is not None
