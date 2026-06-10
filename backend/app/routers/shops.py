from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, get_read_db
from app.models.user import User
from app.schemas.shop import ShopCreate, ShopResponse
from app.schemas.product import ProductCreate, ProductResponse
from app.core.dependencies import get_current_user
from app.services.shop_service import shop_service
from app.repositories.shop_repo import shop_repo
from app.repositories.product_repo import product_repo

router = APIRouter(prefix="/shops", tags=["shops"])

@router.post("", response_model=ShopResponse, status_code=status.HTTP_201_CREATED)
async def open_shop(
    shop_in: ShopCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Open a new vendor store under the current Shop Owner's account."""
    return await shop_service.create_shop(db, shop_in, current_user)

@router.get("/my", response_model=List[ShopResponse])
async def get_my_shops(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_read_db)
):
    """Fetch all vendor stores owned by the active user."""
    return await shop_repo.get_by_owner_id(db, current_user.id)

@router.post("/{shop_id}/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def add_product(
    shop_id: str,
    product_in: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Upload a new product catalog item linked to the owner's shop ID."""
    return await shop_service.add_product_to_shop(db, shop_id, product_in, current_user)
