from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.user import User, UserRole
from app.schemas import TokenData
from app.core.security import SecurityUtils

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """FastAPI dependency to retrieve the active user profile based on the JWT claims."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = SecurityUtils.verify_token(token)
        email: str = payload.get("sub")
        is_admin: bool = payload.get("is_admin", False)
        role: str = payload.get("role", "customer")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email, is_admin=is_admin, role=role)
    except Exception:
        raise credentials_exception

    result = await db.execute(select(User).filter(User.email == token_data.email))
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """FastAPI dependency to assert that the active user possesses Admin privileges."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user does not have enough privileges"
        )
    return current_user

async def get_current_shop_owner(
    current_user: User = Depends(get_current_user)
) -> User:
    """FastAPI dependency to assert that the active user possesses Shop Owner privileges."""
    if current_user.role != UserRole.SHOP_OWNER.value and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered Shop Owners can perform this action."
        )
    return current_user

async def get_current_delivery_partner(
    current_user: User = Depends(get_current_user)
) -> User:
    """FastAPI dependency to assert that the active user possesses Delivery Partner privileges."""
    if current_user.role != UserRole.DELIVERY_PARTNER.value and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only registered Delivery Partners can perform this action."
        )
    return current_user
