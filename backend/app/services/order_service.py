from decimal import Decimal
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.models.user import User
from app.models.product import Product, Cart
from app.models.order import Order, OrderItem
from app.models.delivery import Delivery
from app.schemas.order import CheckoutRequest
from app.repositories.order_repo import order_repo
from app.repositories.product_repo import product_repo
from app.repositories.delivery_repo import delivery_repo

class OrderService:
    async def place_order(self, db: AsyncSession, checkout_in: CheckoutRequest, current_user: User) -> Order:
        """Place an order atomically using SELECT FOR UPDATE pessimistic locking for stock safety under high load."""
        # 1. Fetch user's cart items
        cart_result = await db.execute(
            select(Cart)
            .filter(Cart.user_id == current_user.id)
            .options(joinedload(Cart.product))
        )
        cart_items = cart_result.scalars().all()
        
        if not cart_items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your cart is empty."
            )

        total_amount = Decimal("0.00")
        order_items_to_create = []

        try:
            # 2. Iterate and secure row locks on product items for inventory updates
            for item in cart_items:
                prod_result = await db.execute(
                    select(Product)
                    .filter(Product.id == item.product_id)
                    .with_for_update() # Pessimistic row locking
                )
                product = prod_result.scalars().first()

                if not product:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail=f"Product with id {item.product_id} no longer exists."
                    )

                if product.stock < item.quantity:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient stock for product '{product.name}'. Available: {product.stock}, Requested: {item.quantity}"
                    )

                # Deduct inventory
                product.stock -= item.quantity
                item_total = product.price * item.quantity
                total_amount += item_total

                # Prepare OrderItem record
                order_item = OrderItem(
                    product_id=product.id,
                    quantity=item.quantity,
                    price=product.price
                )
                order_items_to_create.append(order_item)

            # 3. Create the parent Order record
            new_order = Order(
                user_id=current_user.id,
                total_amount=total_amount,
                status="Pending",
                items=order_items_to_create,
                shipping_address=checkout_in.shipping_address,
                customer_phone=checkout_in.phone,
                customer_name=checkout_in.full_name,
                payment_method=checkout_in.payment_method,
            )
            db.add(new_order)

            # 4. Clear shopping cart
            for item in cart_items:
                await db.delete(item)

            # 5. Automatically pre-generate the Delivery tracking record for the fulfillment queue
            import uuid
            tracking_number = f"TRK-{uuid.uuid4().hex[:12].upper()}"
            delivery_record = Delivery(
                order=new_order,
                status="assigned",
                tracking_number=tracking_number
            )
            db.add(delivery_record)

            # Commit transactional unit atomically
            await db.commit()
            await db.refresh(new_order)

            # Eager load relationships for clean API serialization
            final_result = await db.execute(
                select(Order)
                .filter(Order.id == new_order.id)
                .options(joinedload(Order.items).joinedload(OrderItem.product))
            )
            
            # Dispatch Async Background Jobs here if Celery is enabled
            # order_tasks.process_post_checkout.delay(new_order.id)
            
            return final_result.scalars().first()

        except Exception as e:
            await db.rollback()
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"An error occurred during checkout processing: {str(e)}"
            )

order_service = OrderService()
