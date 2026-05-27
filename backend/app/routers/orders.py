from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from decimal import Decimal

from app.database import get_db
from app.models import Cart, Product, User, Order, OrderItem
from app.schemas import OrderResponse, CheckoutRequest
from app.auth import get_current_user

router = APIRouter(prefix="/orders", tags=["orders"])

@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def checkout(
    checkout_data: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Fetch all cart items for the user
    cart_result = await db.execute(
        select(Cart)
        .filter(Cart.user_id == current_user.id)
        .options(joinedload(Cart.product))
    )
    cart_items = cart_result.scalars().all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your cart is empty"
        )

    # We will run stock validation and update inside a transaction with locking
    total_amount = Decimal("0.00")
    order_items_to_create = []

    try:
        for item in cart_items:
            # Query product with FOR UPDATE lock to prevent concurrent modifications
            prod_result = await db.execute(
                select(Product)
                .filter(Product.id == item.product_id)
                .with_for_update()
            )
            product = prod_result.scalars().first()

            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product with id {item.product_id} no longer exists"
                )

            if product.stock < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for product '{product.name}'. Available: {product.stock}, Requested: {item.quantity}"
                )

            # Deduct stock
            product.stock -= item.quantity
            item_total = product.price * item.quantity
            total_amount += item_total

            # Prepare OrderItem
            order_item = OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price=product.price
            )
            order_items_to_create.append(order_item)

        # Create Order with checkout info
        new_order = Order(
            user_id=current_user.id,
            total_amount=total_amount,
            status="Pending",
            items=order_items_to_create,
            shipping_address=checkout_data.shipping_address,
            customer_phone=checkout_data.phone,
            customer_name=checkout_data.full_name,
            payment_method=checkout_data.payment_method,
        )
        db.add(new_order)

        # Clear user's cart
        for item in cart_items:
            await db.delete(item)

        # Commit everything atomically
        await db.commit()
        await db.refresh(new_order)

        # Fetch full order details with relationships for the response
        final_result = await db.execute(
            select(Order)
            .filter(Order.id == new_order.id)
            .options(
                joinedload(Order.items).joinedload(OrderItem.product)
            )
        )
        return final_result.scalars().first()

    except Exception as e:
        await db.rollback()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during checkout: {str(e)}"
        )

@router.get("", response_model=List[OrderResponse])
async def get_order_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Order)
        .filter(Order.user_id == current_user.id)
        .options(
            joinedload(Order.items).joinedload(OrderItem.product)
        )
        .order_by(Order.created_at.desc())
    )
    orders = result.scalars().unique().all()
    return orders
