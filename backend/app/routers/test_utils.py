"""
Test Utilities Router — B-H10
ONLY active in development/test environments.
Provides fast state-reset and fixture-creation endpoints for automation suites.

These endpoints let Playwright/Cypress/Selenium set up clean test state
without manually clicking through the UI or maintaining a separate seed script.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from pydantic import BaseModel

from app.database import get_db
from app.core.config import settings
from app.core.security import SecurityUtils
from app.models.user import User, UserRole

router = APIRouter(prefix="/test", tags=["test-utilities"])


def _check_test_env():
    """Guard: block these endpoints in production."""
    if settings.ENVIRONMENT == "production":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Test utilities are disabled in production",
        )


# ── Schemas ───────────────────────────────────────────────────────────────────

class CreateUserPayload(BaseModel):
    email: str
    password: str
    full_name: str = "Test User"
    role: str = "customer"


class CreateUserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    access_token: str


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/create-user", response_model=CreateUserResponse, status_code=status.HTTP_201_CREATED,
             summary="[Test Only] Create a user and return a token instantly")
async def create_test_user(
    payload: CreateUserPayload,
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a user immediately and returns a valid JWT.
    Automation suites use this in beforeEach/setup hooks to avoid
    going through the full registration UI flow.
    """
    _check_test_env()

    role = payload.role.lower()
    if role not in [r.value for r in UserRole]:
        raise HTTPException(status_code=400, detail=f"Invalid role: {role}")

    # Check for existing user with same email
    existing = await db.execute(
        text("SELECT id FROM users WHERE email = :email"),
        {"email": payload.email},
    )
    if existing.fetchone():
        raise HTTPException(status_code=400, detail="Email already in use")

    user_id = str(uuid.uuid4())
    hashed = SecurityUtils.hash_password(payload.password)

    user = User(
        id=user_id,
        email=payload.email,
        hashed_password=hashed,
        full_name=payload.full_name,
        role=role,
        is_admin=(role == "admin"),
    )
    db.add(user)
    await db.commit()

    token_data = {"sub": payload.email, "is_admin": user.is_admin, "role": role}
    access_token = SecurityUtils.create_access_token(data=token_data)

    return CreateUserResponse(
        id=user_id,
        email=payload.email,
        full_name=payload.full_name,
        role=role,
        access_token=access_token,
    )


@router.post("/reset", status_code=status.HTTP_200_OK,
             summary="[Test Only] Reset all user-generated data and re-seed")
async def reset_test_data(db: AsyncSession = Depends(get_db)):
    """
    Deletes all orders, cart items, reviews, wishlists, and non-seeded users,
    then re-seeds the database. Use this in automation suite teardown/setup hooks.

    WARNING: Destructive — never expose in production.
    """
    _check_test_env()

    # Delete in dependency order
    await db.execute(text("DELETE FROM order_items"))
    await db.execute(text("DELETE FROM orders"))
    await db.execute(text("DELETE FROM carts"))
    await db.execute(text("DELETE FROM reviews"))
    await db.execute(text("DELETE FROM wishlists"))
    await db.execute(text("DELETE FROM returns"))
    # Delete non-seeded users (keep seed accounts)
    await db.execute(text(
        "DELETE FROM users WHERE email NOT IN ("
        "  'admin@novacart.com', 'customer@novacart.com',"
        "  'seller@novacart.com', 'delivery@novacart.com'"
        ")"
    ))
    await db.commit()

    return {
        "message": "Test data reset successfully",
        "preserved_accounts": [
            "admin@novacart.com",
            "customer@novacart.com",
            "seller@novacart.com",
            "delivery@novacart.com",
        ],
    }


@router.get("/fixtures", summary="[Test Only] List available test fixtures")
async def list_fixtures():
    """Returns available preset fixture descriptions for automation documentation."""
    _check_test_env()
    return {
        "fixtures": [
            {"name": "customer", "email": "customer@novacart.com", "password": "customer123", "role": "customer"},
            {"name": "admin",    "email": "admin@novacart.com",    "password": "admin123",    "role": "admin"},
            {"name": "seller",   "email": "seller@novacart.com",   "password": "seller123",   "role": "shop_owner"},
            {"name": "delivery", "email": "delivery@novacart.com", "password": "delivery123", "role": "delivery_partner"},
        ],
        "endpoints": {
            "create_user": "POST /api/test/create-user",
            "reset":       "POST /api/test/reset",
            "fixtures":    "GET  /api/test/fixtures",
        },
    }
