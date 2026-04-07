from rest_framework.permissions import BasePermission, SAFE_METHODS
from accounts.models import UserRole


class SalePermission(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class VoidSalePermission(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in (UserRole.ADMIN, UserRole.MANAGER)
        )
