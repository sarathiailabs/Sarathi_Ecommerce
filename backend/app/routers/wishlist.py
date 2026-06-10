from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Wishlist, Product, User
from app.schemas import WishlistItemResponse, WishlistItemCreate
from app.core.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/wishlist", tags=["wishlist"])


@router.post("", response_model=WishlistItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_wishlist(
    item: WishlistItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a product to wishlist"""
    # Check if product exists
    result = await db.execute(select(Product).where(Product.id == item.product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Check if already in wishlist
    result = await db.execute(
        select(Wishlist).where(
            (Wishlist.user_id == current_user.id) & (Wishlist.product_id == item.product_id)
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Product already in wishlist")
    
    wishlist_item = Wishlist(
        user_id=current_user.id,
        product_id=item.product_id
    )
    
    db.add(wishlist_item)
    await db.commit()
    await db.refresh(wishlist_item)
    await db.refresh(wishlist_item, ["product"])
    
    return wishlist_item


@router.get("", response_model=List[WishlistItemResponse])
async def get_wishlist(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20
):
    """Get user's wishlist"""
    result = await db.execute(
        select(Wishlist)
        .where(Wishlist.user_id == current_user.id)
        .order_by(Wishlist.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    items = result.scalars().all()
    
    # Ensure product relationships are loaded
    for item in items:
        await db.refresh(item, ["product"])
    
    return items


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_wishlist(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a product from wishlist"""
    result = await db.execute(
        select(Wishlist).where(
            (Wishlist.user_id == current_user.id) & (Wishlist.product_id == product_id)
        )
    )
    wishlist_item = result.scalar_one_or_none()
    
    if not wishlist_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not in wishlist")
    
    await db.delete(wishlist_item)
    await db.commit()


@router.get("/check/{product_id}")
async def check_in_wishlist(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Check if a product is in wishlist"""
    result = await db.execute(
        select(Wishlist).where(
            (Wishlist.user_id == current_user.id) & (Wishlist.product_id == product_id)
        )
    )
    item = result.scalar_one_or_none()
    
    return {"in_wishlist": item is not None}


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_wishlist(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Clear entire wishlist"""
    result = await db.execute(
        select(Wishlist).where(Wishlist.user_id == current_user.id)
    )
    items = result.scalars().all()
    
    for item in items:
        await db.delete(item)
    
    await db.commit()
