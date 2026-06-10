"""
Security utilities for enterprise application
JWT handling, password hashing, encryption, role-based access control
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from app.core.config import settings

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SecurityUtils:
    """Utilities for security operations"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash a password using bcrypt"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def create_access_token(
        data: Dict[str, Any],
        expires_delta: Optional[timedelta] = None
    ) -> str:
        """
        Create JWT access token
        
        Args:
            data: Payload data to include in token
            expires_delta: Token expiration time
            
        Returns:
            Encoded JWT token
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Dict[str, Any]:
        """
        Verify and decode JWT token
        
        Args:
            token: JWT token to verify
            
        Returns:
            Decoded token payload
            
        Raises:
            HTTPException: If token is invalid or expired
        """
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET,
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except JWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    @staticmethod
    def create_refresh_token(user_id: int) -> str:
        """Create refresh token with longer expiration"""
        data = {"sub": str(user_id), "type": "refresh"}
        expires_delta = timedelta(days=settings.JWT_REFRESH_EXPIRATION_DAYS)
        return SecurityUtils.create_access_token(data, expires_delta)

class RoleBasedAccessControl:
    """Role-based access control utilities"""
    
    # Role hierarchy and permissions
    ROLES = {
        "customer": {
            "permissions": ["view_products", "create_order", "view_orders", "manage_cart"]
        },
        "admin": {
            "permissions": [
                "manage_users", "manage_products", "manage_orders", "manage_payments",
                "view_analytics", "manage_admins", "manage_coupons"
            ]
        },
        "shop_owner": {
            "permissions": [
                "manage_shop", "manage_shop_products", "manage_shop_inventory",
                "view_shop_orders", "view_shop_analytics"
            ]
        },
        "delivery_agent": {
            "permissions": [
                "view_deliveries", "update_delivery_status", "manage_shipments",
                "view_earnings"
            ]
        },
        "delivery_company_admin": {
            "permissions": [
                "manage_delivery_agents", "manage_delivery_zones", "view_company_analytics",
                "manage_delivery_settings"
            ]
        }
    }
    
    @staticmethod
    def has_permission(user_role: str, required_permission: str) -> bool:
        """
        Check if user role has required permission
        
        Args:
            user_role: User's role
            required_permission: Required permission
            
        Returns:
            True if role has permission, False otherwise
        """
        if user_role not in RoleBasedAccessControl.ROLES:
            return False
        
        permissions = RoleBasedAccessControl.ROLES[user_role].get("permissions", [])
        return required_permission in permissions
    
    @staticmethod
    def has_any_permission(user_role: str, permissions: list) -> bool:
        """Check if user has any of the required permissions"""
        return any(
            RoleBasedAccessControl.has_permission(user_role, perm)
            for perm in permissions
        )
    
    @staticmethod
    def has_all_permissions(user_role: str, permissions: list) -> bool:
        """Check if user has all required permissions"""
        return all(
            RoleBasedAccessControl.has_permission(user_role, perm)
            for perm in permissions
        )

class EncryptionUtils:
    """Utilities for data encryption"""
    
    @staticmethod
    def encrypt_field(value: str, key: str = settings.JWT_SECRET) -> str:
        """Encrypt sensitive field"""
        # Implementation would use Fernet or similar
        # For now, return as-is
        return value
    
    @staticmethod
    def decrypt_field(encrypted_value: str, key: str = settings.JWT_SECRET) -> str:
        """Decrypt sensitive field"""
        # Implementation would use Fernet or similar
        # For now, return as-is
        return encrypted_value
