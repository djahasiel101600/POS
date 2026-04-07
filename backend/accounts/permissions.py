from rest_framework.permissions import BasePermission
from .models import UserRole


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == UserRole.ADMIN)


class IsAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated
            and request.user.role in (UserRole.ADMIN, UserRole.MANAGER)
        )


class IsAnyRole(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)
