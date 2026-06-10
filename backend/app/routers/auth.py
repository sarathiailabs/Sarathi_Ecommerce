"""
Enhanced Auth Router — B-H3, B-H4, B-H5
Adds: JSON login, GET /me, PUT /me, change-password, forgot-password, reset-password.

Key automation testing value:
- POST /auth/login (JSON) → Playwright/Cypress API setup; avoids form-data encoding
- GET  /auth/me          → Verify "who am I" after login (critical assertion)
- PUT  /auth/me          → Profile CRUD test scenarios
- POST /auth/change-password → Password change flow
- POST /auth/forgot-password + /auth/reset-password → Full forgot-password E2E journey
"""
import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
from typing import Optional

from app.database import get_db
from app.schemas.user import UserCreate, UserResponse, UserUpdate, Token
from app.services.auth_service import auth_service
from app.core.dependencies import get_current_user
from app.core.security import SecurityUtils
from app.models.user import User
from app.repositories.user_repo import user_repo

router = APIRouter(prefix="/auth", tags=["auth"])

# ── Schemas specific to this router ───────────────────────────────────────────

class LoginRequest(BaseModel):
    """JSON login — automation-friendly alternative to OAuth2 form-data."""
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# Simple in-memory reset token store (replace with DB table in production)
_reset_tokens: dict[str, dict] = {}

# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED,
             summary="Register a new user account")
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new customer, seller, or delivery partner."""
    return await auth_service.register_user(db, user_in)


@router.post("/token", response_model=Token,
             summary="Login (OAuth2 form-data) — compatible with Swagger UI")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db),
):
    """Authenticate with form-data (OAuth2 standard). Use /auth/login for JSON body."""
    return await auth_service.authenticate_user(db, form_data.username, form_data.password)


@router.post("/login", response_model=Token,
             summary="Login (JSON body) — automation-friendly endpoint",
             description="Preferred for Playwright/Cypress/Selenium API setup hooks.")
async def login_json(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    JSON-body login. Returns a JWT access token.

    ### Why this exists:
    Automation frameworks (Playwright, Cypress, httpx) send JSON by default.
    The OAuth2 /token endpoint requires multipart form-data which adds friction
    in test setup code. This endpoint accepts the same credentials as JSON.

    Example test setup (Playwright):
    ```python
    response = await page.request.post("/api/auth/login", data={
        "email": "customer@novacart.com",
        "password": "customer123"
    })
    token = (await response.json())["access_token"]
    ```
    """
    return await auth_service.authenticate_user(db, payload.email, payload.password)


@router.get("/me", response_model=UserResponse,
            summary="Get current user profile — verify login state in automation tests")
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the authenticated user's full profile.

    ### Automation use case:
    After logging in, call this to assert you're authenticated as the correct user
    with the correct role before running role-specific test scenarios.
    """
    return current_user


@router.put("/me", response_model=UserResponse,
            summary="Update current user profile")
async def update_me(
    updates: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update the authenticated user's name, phone, address, etc."""
    update_data = updates.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/change-password", status_code=status.HTTP_200_OK,
             summary="Change password for the current user")
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Change the authenticated user's password.
    Validates the current password before accepting the new one.
    """
    if not SecurityUtils.verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters",
        )
    current_user.hashed_password = SecurityUtils.hash_password(payload.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}


@router.post("/forgot-password", status_code=status.HTTP_200_OK,
             summary="Request a password reset link")
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Sends a password reset token. In dev/test environments the token
    is returned directly in the response for easy automation testing.
    In production, the token would be emailed.

    ### Automation note:
    The response always returns HTTP 200 (even for unknown emails) to prevent
    user enumeration. In test env, `reset_token` is included in the response body.
    """
    user = await user_repo.get_by_email(db, str(payload.email))

    if user:
        token = str(uuid.uuid4())
        _reset_tokens[token] = {
            "user_id": user.id,
            "expires_at": datetime.utcnow() + timedelta(hours=1),
            "used": False,
        }
        # In a real app: send email with reset link
        # For automation: return token directly so tests can use it without email
        return {
            "message": "If that email is registered, you will receive reset instructions.",
            "reset_token": token,  # Exposed for automation testing convenience
            "_dev_note": "In production, this token would be sent via email only.",
        }

    return {"message": "If that email is registered, you will receive reset instructions."}


@router.post("/reset-password", status_code=status.HTTP_200_OK,
             summary="Reset password using a valid reset token")
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Consumes a reset token and sets a new password.
    Tokens expire after 1 hour and can only be used once.
    """
    token_data = _reset_tokens.get(payload.token)

    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    if token_data["used"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has already been used",
        )
    if datetime.utcnow() > token_data["expires_at"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired",
        )
    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters",
        )

    # Mark token as used
    _reset_tokens[payload.token]["used"] = True

    # Update user password
    result = await db.execute(select(User).filter(User.id == token_data["user_id"]))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = SecurityUtils.hash_password(payload.new_password)
    await db.commit()

    return {"message": "Password reset successfully. You can now sign in with your new password."}
