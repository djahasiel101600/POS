from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound


class ServiceException(Exception):
    """Base exception for service layer errors."""
    pass


class InsufficientStockError(ServiceException):
    """Raised when stock is not sufficient for an operation."""
    pass


class InvalidOperationError(ServiceException):
    """Raised when an operation is not valid in current state."""
    pass
