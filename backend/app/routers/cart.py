from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload

from app.database import get_db
from app.models import Cart, Product, User
from app.schemas import CartItemCreate, CartItemResponse
from app.auth import get_current_user

router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("", response_model=List[CartItemResponse])
async def get_cart(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Cart)
        .filter(Cart.user_id == current_user.id)
        .options(joinedload(Cart.product))
    )
    cart_items = result.scalars().all()
    return cart_items

@router.post("/items", response_model=CartItemResponse)
async def add_or_update_cart_item(
    item_in: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Check if product exists and check stock
    prod_result = await db.execute(select(Product).filter(Product.id == item_in.product_id))
    product = prod_result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    if product.stock < item_in.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock. Only {product.stock} items available."
        )

    # Check if item is already in cart
    cart_result = await db.execute(
        select(Cart)
        .filter(Cart.user_id == current_user.id, Cart.product_id == item_in.product_id)
        .options(joinedload(Cart.product))
    )
    cart_item = cart_result.scalars().first()

    if cart_item:
        # Update quantity
        cart_item.quantity = item_in.quantity
    else:
        # Add new item
        cart_item = Cart(
            user_id=current_user.id,
            product_id=item_in.product_id,
            quantity=item_in.quantity
        )
        db.add(cart_item)

    await db.commit()
    # Refresh to load product relationship if it was created
    await db.refresh(cart_item)
    
    # Run a fresh select to ensure the product relation is properly loaded and return
    result = await db.execute(
        select(Cart)
        .filter(Cart.id == cart_item.id)
        .options(joinedload(Cart.product))
    )
    return result.scalars().first()

@router.delete("/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_cart_item(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Cart).filter(Cart.user_id == current_user.id, Cart.product_id == product_id)
    )
    cart_item = result.scalars().first()
    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found in cart"
        )
    
    await db.delete(cart_item)
    await db.commit()
    return None
