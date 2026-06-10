"""
Enhanced Orders Router — B-H6, B-H7, B-H8
Adds: GET /orders/:id, POST /orders/:id/cancel, order timeline tracking.

Key automation testing value:
- GET /orders/:id → Full order detail with items + timeline (E2E journey assertion)
- POST /orders/:id/cancel → Customer self-service cancellation flow
- Order timeline shows full status history (history assertion in tests)
"""
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from pydantic import BaseModel

from app.database import get_db, get_read_db
from app.models.user import User
from app.models.order import Order, OrderItem
from app.schemas.order import OrderResponse, CheckoutRequest
from app.core.dependencies import get_current_user
from app.services.order_service import order_service
from app.repositories.order_repo import order_repo

router = APIRouter(prefix="/orders", tags=["orders"])


class CancelOrderRequest(BaseModel):
    reason: Optional[str] = "Customer requested cancellation"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED,
             summary="Place an order from current cart")
async def checkout(
    checkout_data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Place an order atomically using pessimistic locking for stock safety."""
    return await order_service.place_order(db, checkout_data, current_user)


@router.get("", response_model=List[OrderResponse],
            summary="Get current user's order history (cursor-paginated)")
async def get_order_history(
    cursor: Optional[datetime] = None,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_read_db),
):
    """Retrieve customer order history. Uses index-seek cursor pagination for scale."""
    return await order_repo.get_orders_cursor(db, current_user.id, cursor=cursor, limit=limit)


@router.get("/{order_id}", response_model=OrderResponse,
            summary="Get a single order by ID with full item details + timeline")
async def get_order_by_id(
    order_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_read_db),
):
    """
    Returns full order detail including all line items and the status timeline.

    ### Automation use cases:
    - After checkout, assert the created order has correct total/items
    - After admin status update, assert the new status is reflected
    - Verify tracking number appears after shipping
    """
    result = await db.execute(
        select(Order)
        .filter(Order.id == order_id)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
    )
    order = result.scalars().first()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    # Authorization: customers can only see their own orders
    if not current_user.is_admin and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this order",
        )

    return order


@router.post("/{order_id}/cancel", status_code=status.HTTP_200_OK,
             summary="Cancel a pending order (customer self-service)")
async def cancel_order(
    order_id: str,
    payload: CancelOrderRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Allows a customer to cancel their own order if it is still in Pending status.

    ### Business rules tested by automation:
    - ✓ Pending order → cancellation succeeds
    - ✗ Shipped/Delivered order → 400 (cannot cancel)
    - ✗ Another user's order → 403 (IDOR protection)
    - ✗ Non-existent order → 404
    """
    result = await db.execute(
        select(Order)
        .filter(Order.id == order_id)
        .options(joinedload(Order.items).joinedload(OrderItem.product))
    )
    order = result.scalars().first()

    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    if not current_user.is_admin and order.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to cancel this order",
        )

    cancellable_statuses = {"Pending", "Processing"}
    if order.status not in cancellable_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel an order with status '{order.status}'. "
                   f"Only orders in {cancellable_statuses} can be cancelled.",
        )

    # Restore stock for each item
    for item in order.items:
        if item.product:
            item.product.stock += item.quantity

    order.status = "Cancelled"
    await db.commit()
    await db.refresh(order)

    return {
        "message": "Order cancelled successfully",
        "order_id": order_id,
        "reason": payload.reason,
        "status": "Cancelled",
    }
