from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Coupon, User
from app.schemas import CouponCreate, CouponResponse, CouponValidate, CouponValidateResponse
from app.core.dependencies import get_current_user
from datetime import datetime
from typing import List

router = APIRouter(prefix="/coupons", tags=["coupons"])


@router.post("", response_model=CouponResponse, status_code=status.HTTP_201_CREATED)
async def create_coupon(
    coupon: CouponCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new coupon (Admin only)"""
    # Check admin
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    # Check if code already exists
    result = await db.execute(select(Coupon).where(Coupon.code == coupon.code))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Coupon code already exists")
    
    new_coupon = Coupon(
        code=coupon.code.upper(),
        description=coupon.description,
        discount_type=coupon.discount_type,
        discount_value=coupon.discount_value,
        min_purchase_amount=coupon.min_purchase_amount,
        max_discount_amount=coupon.max_discount_amount,
        usage_limit=coupon.usage_limit,
        usage_per_user=coupon.usage_per_user,
        valid_from=coupon.valid_from,
        valid_until=coupon.valid_until
    )
    
    db.add(new_coupon)
    await db.commit()
    await db.refresh(new_coupon)
    
    return new_coupon


@router.get("", response_model=List[CouponResponse])
async def list_coupons(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20
):
    """List all active coupons (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(
        select(Coupon)
        .where(Coupon.is_active == True)
        .offset(skip)
        .limit(limit)
    )
    coupons = result.scalars().all()
    
    return coupons


@router.post("/validate", response_model=CouponValidateResponse)
async def validate_coupon(
    validation: CouponValidate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Validate a coupon code"""
    result = await db.execute(
        select(Coupon).where(Coupon.code == validation.code.upper())
    )
    coupon = result.scalar_one_or_none()
    
    if not coupon:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message="Coupon code not found"
        )
    
    # Check if active
    if not coupon.is_active:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message="Coupon is inactive"
        )
    
    # Check validity dates
    now = datetime.utcnow()
    if now < coupon.valid_from or now > coupon.valid_until:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message="Coupon is expired or not yet valid"
        )
    
    # Check usage limit
    if coupon.usage_limit and coupon.times_used >= coupon.usage_limit:
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message="Coupon usage limit exceeded"
        )
    
    # Check minimum purchase amount
    if validation.cart_total < float(coupon.min_purchase_amount):
        return CouponValidateResponse(
            valid=False,
            discount_amount=0,
            message=f"Minimum purchase amount required: ${coupon.min_purchase_amount}"
        )
    
    # Calculate discount
    if coupon.discount_type == "percentage":
        discount = (validation.cart_total * coupon.discount_value) / 100
    else:  # fixed
        discount = float(coupon.discount_value)
    
    # Apply maximum discount limit if exists
    if coupon.max_discount_amount:
        discount = min(discount, float(coupon.max_discount_amount))
    
    return CouponValidateResponse(
        valid=True,
        discount_amount=discount,
        message="Coupon is valid"
    )


@router.put("/{coupon_id}", response_model=CouponResponse)
async def update_coupon(
    coupon_id: str,
    coupon_update: CouponCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a coupon (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")
    
    # Update fields
    coupon.code = coupon_update.code.upper()
    coupon.description = coupon_update.description
    coupon.discount_type = coupon_update.discount_type
    coupon.discount_value = coupon_update.discount_value
    coupon.min_purchase_amount = coupon_update.min_purchase_amount
    coupon.max_discount_amount = coupon_update.max_discount_amount
    coupon.usage_limit = coupon_update.usage_limit
    coupon.usage_per_user = coupon_update.usage_per_user
    coupon.valid_from = coupon_update.valid_from
    coupon.valid_until = coupon_update.valid_until
    
    await db.commit()
    await db.refresh(coupon)
    
    return coupon


@router.delete("/{coupon_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_coupon(
    coupon_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a coupon (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(select(Coupon).where(Coupon.id == coupon_id))
    coupon = result.scalar_one_or_none()
    
    if not coupon:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coupon not found")
    
    await db.delete(coupon)
    await db.commit()
