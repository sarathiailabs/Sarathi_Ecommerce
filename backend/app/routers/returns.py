from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Return, Order, OrderItem, User
from app.schemas import ReturnCreate, ReturnResponse
from app.core.dependencies import get_current_user
from datetime import datetime
from typing import List

router = APIRouter(prefix="/returns", tags=["returns"])


@router.post("", response_model=ReturnResponse, status_code=status.HTTP_201_CREATED)
async def create_return(
    return_request: ReturnCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a return request"""
    # Check if order exists and belongs to user
    result = await db.execute(select(Order).where(Order.id == return_request.order_id))
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    
    if order.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to return items from this order")
    
    # Check if order item exists
    result = await db.execute(
        select(OrderItem).where(
            (OrderItem.order_id == return_request.order_id) & 
            (OrderItem.product_id == return_request.product_id)
        )
    )
    order_item = result.scalar_one_or_none()
    
    if not order_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found in order")
    
    # Check quantity
    if return_request.quantity > order_item.quantity:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Return quantity exceeds ordered quantity")
    
    # Calculate refund amount
    refund_amount = float(order_item.price) * return_request.quantity
    
    new_return = Return(
        order_id=return_request.order_id,
        user_id=current_user.id,
        product_id=return_request.product_id,
        quantity=return_request.quantity,
        reason=return_request.reason,
        description=return_request.description,
        refund_amount=refund_amount
    )
    
    db.add(new_return)
    await db.commit()
    await db.refresh(new_return)
    
    return new_return


@router.get("", response_model=List[ReturnResponse])
async def get_returns(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20
):
    """Get user's returns"""
    result = await db.execute(
        select(Return)
        .where(Return.user_id == current_user.id)
        .order_by(Return.requested_at.desc())
        .offset(skip)
        .limit(limit)
    )
    returns = result.scalars().all()
    
    return returns


@router.get("/{return_id}", response_model=ReturnResponse)
async def get_return(
    return_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get return details"""
    result = await db.execute(select(Return).where(Return.id == return_id))
    return_request = result.scalar_one_or_none()
    
    if not return_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return request not found")
    
    if return_request.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    
    return return_request


@router.get("/admin/all", response_model=List[ReturnResponse])
async def get_all_returns(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 20
):
    """Get all returns (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(
        select(Return)
        .order_by(Return.requested_at.desc())
        .offset(skip)
        .limit(limit)
    )
    returns = result.scalars().all()
    
    return returns


@router.put("/{return_id}/approve", response_model=ReturnResponse)
async def approve_return(
    return_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Approve a return request (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(select(Return).where(Return.id == return_id))
    return_request = result.scalar_one_or_none()
    
    if not return_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return request not found")
    
    return_request.status = "Approved"
    await db.commit()
    await db.refresh(return_request)
    
    return return_request


@router.put("/{return_id}/reject", response_model=ReturnResponse)
async def reject_return(
    return_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reject a return request (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(select(Return).where(Return.id == return_id))
    return_request = result.scalar_one_or_none()
    
    if not return_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return request not found")
    
    return_request.status = "Rejected"
    await db.commit()
    await db.refresh(return_request)
    
    return return_request


@router.put("/{return_id}/refund", response_model=ReturnResponse)
async def process_refund(
    return_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Process refund for approved return (Admin only)"""
    if not current_user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    
    result = await db.execute(select(Return).where(Return.id == return_id))
    return_request = result.scalar_one_or_none()
    
    if not return_request:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Return request not found")
    
    if return_request.status != "Approved":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Can only refund approved returns")
    
    return_request.status = "Refunded"
    return_request.processed_at = datetime.utcnow()
    await db.commit()
    await db.refresh(return_request)
    
    return return_request
