from rest_framework.permissions import BasePermission

from accounts.models import Profile


def user_role(user):
    role = getattr(getattr(user, 'profile', None), 'role', '')
    if user.is_superuser and not role:
        return Profile.ROLE_SUPER_ADMIN
    return role


def is_super_admin(user) -> bool:
    return user.is_authenticated and user_role(user) == Profile.ROLE_SUPER_ADMIN


class IsSuperAdmin(BasePermission):
    message = 'Only super admins can perform this action.'

    def has_permission(self, request, view):
        return is_super_admin(request.user)


class IsCompanyAdmin(BasePermission):
    message = 'Only company admins can perform this action.'

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and user_role(request.user) == Profile.ROLE_COMPANY_ADMIN
        )


class IsTicketParticipant(BasePermission):
    """Company admins of the ticket's company + super admins may interact."""

    def has_object_permission(self, request, view, obj):
        ticket = obj if isinstance(obj, type(obj)) and hasattr(obj, 'company') else getattr(obj, 'ticket', obj)
        if is_super_admin(request.user):
            return True
        return request.user.id == ticket.created_by_id
