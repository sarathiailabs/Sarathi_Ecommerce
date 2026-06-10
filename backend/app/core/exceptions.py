"""
Exception definitions for enterprise application
Custom exceptions for better error handling and logging
"""

class APIException(Exception):
    """Base API exception"""
    def __init__(self, status_code: int, message: str, details: str = None):
        self.status_code = status_code
        self.message = message
        self.details = details
        super().__init__(self.message)

class AuthenticationError(APIException):
    """Authentication failed"""
    def __init__(self, message: str = "Authentication failed", details: str = None):
        super().__init__(status_code=401, message=message, details=details)

class AuthorizationError(APIException):
    """User lacks required permissions"""
    def __init__(self, message: str = "Insufficient permissions", details: str = None):
        super().__init__(status_code=403, message=message, details=details)

class NotFoundError(APIException):
    """Resource not found"""
    def __init__(self, resource: str = "Resource", details: str = None):
        super().__init__(status_code=404, message=f"{resource} not found", details=details)

class ValidationError(APIException):
    """Data validation failed"""
    def __init__(self, message: str = "Validation failed", details: str = None):
        super().__init__(status_code=422, message=message, details=details)

class ConflictError(APIException):
    """Resource already exists"""
    def __init__(self, message: str = "Resource already exists", details: str = None):
        super().__init__(status_code=409, message=message, details=details)

class InternalServerError(APIException):
    """Internal server error"""
    def __init__(self, message: str = "Internal server error", details: str = None):
        super().__init__(status_code=500, message=message, details=details)

class ServiceError(Exception):
    """Service layer error"""
    pass

class RepositoryError(Exception):
    """Repository layer error"""
    pass

class DatabaseError(Exception):
    """Database operation error"""
    pass

class PaymentError(Exception):
    """Payment processing error"""
    pass

class DeliveryError(Exception):
    """Delivery service error"""
    pass

class NotificationError(Exception):
    """Notification sending error"""
    pass
