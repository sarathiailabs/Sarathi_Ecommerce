from datetime import datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.delivery_repo import delivery_repo
from app.repositories.order_repo import order_repo
from app.schemas.delivery import DeliveryUpdate
from app.models.user import UserRole, User
from app.models.delivery import Delivery

class DeliveryService:
    async def claim_delivery(self, db: AsyncSession, delivery_id: str, current_user: User) -> Delivery:
        """Assign an active shipment task to a claiming Delivery Partner."""
        if current_user.role != UserRole.DELIVERY_PARTNER.value and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only authenticated Delivery Partners can claim a shipment."
            )

        delivery = await delivery_repo.get(db, delivery_id)
        if not delivery:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery record not found."
            )

        if delivery.partner_id is not None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This delivery assignment has already been claimed."
            )

        # Claim the delivery
        delivery.partner_id = current_user.id
        delivery.status = "picked_up"
        delivery.updated_at = datetime.utcnow()
        
        # Sync the parent order status
        order = await order_repo.get(db, delivery.order_id)
        if order:
            order.status = "Shipped"

        db.add(delivery)
        await db.commit()
        await db.refresh(delivery)
        return delivery

    async def update_delivery_status(self, db: AsyncSession, delivery_id: str, update_in: DeliveryUpdate, current_user: User) -> Delivery:
        """Update route tracking states and estimate completions."""
        delivery = await delivery_repo.get(db, delivery_id)
        if not delivery:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Delivery record not found."
            )

        # Enforce carrier ownership verification
        if delivery.partner_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update this shipment."
            )

        if update_in.status:
            delivery.status = update_in.status
            if update_in.status == "delivered":
                delivery.actual_delivery = datetime.utcnow()
                # Update base order status
                order = await order_repo.get(db, delivery.order_id)
                if order:
                    order.status = "Delivered"

        delivery.updated_at = datetime.utcnow()
        db.add(delivery)
        await db.commit()
        await db.refresh(delivery)
        return delivery

delivery_service = DeliveryService()
