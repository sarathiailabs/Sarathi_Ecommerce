from datetime import timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import SecurityUtils
from app.repositories.user_repo import user_repo
from app.schemas.user import UserCreate, Token, UserResponse
from app.models.user import UserRole

class AuthService:
    async def register_user(self, db: AsyncSession, user_in: UserCreate) -> UserResponse:
        """Register a new customer or partner, checking for pre-existing email profiles."""
        existing_user = await user_repo.get_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists."
            )
        
        # Enforce role matching
        role = user_in.role.lower() if user_in.role else UserRole.CUSTOMER.value
        if role not in [r.value for r in UserRole]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid registration role: {role}"
            )

        hashed_password = SecurityUtils.hash_password(user_in.password)
        obj_in = {
            "email": user_in.email,
            "hashed_password": hashed_password,
            "full_name": user_in.full_name,
            "role": role,
            "is_admin": True if role == UserRole.ADMIN.value else False
        }
        
        db_user = await user_repo.create(db, obj_in=obj_in)
        return db_user

    async def authenticate_user(self, db: AsyncSession, username: str, password: str) -> Token:
        """Authenticate user credentials and generate a JWT access token containing role claims."""
        user = await user_repo.get_by_email(db, username)
        if not user or not SecurityUtils.verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create token with user role and admin flags
        token_data = {
            "sub": user.email,
            "is_admin": user.is_admin,
            "role": user.role
        }
        access_token = SecurityUtils.create_access_token(data=token_data)
        return Token(access_token=access_token, token_type="bearer")

auth_service = AuthService()
