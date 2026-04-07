from rest_framework.permissions import BasePermission, SAFE_METHODS
from accounts.models import UserRole


class ProductPermission(BasePermission):
    """Admins and managers can write; cashiers can only read."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method in SAFE_METHODS:
            return True
        return request.user.role in (UserRole.ADMIN, UserRole.MANAGER)
