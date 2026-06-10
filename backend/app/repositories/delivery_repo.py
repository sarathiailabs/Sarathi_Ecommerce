from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.models.delivery import Delivery
from app.repositories.base import BaseRepository

class DeliveryRepository(BaseRepository[Delivery]):
    def __init__(self):
        super().__init__(Delivery)

    async def get_by_partner_id(self, db: AsyncSession, partner_id: str) -> List[Delivery]:
        """Fetch all shipping jobs claimed by a specific delivery company/agent."""
        result = await db.execute(
            select(Delivery)
            .filter(Delivery.partner_id == partner_id)
            .options(joinedload(Delivery.order))
        )
        return result.scalars().all()

    async def get_unassigned_deliveries(self, db: AsyncSession) -> List[Delivery]:
        """Retrieve all active orders awaiting delivery carrier pickup."""
        result = await db.execute(
            select(Delivery)
            .filter(Delivery.status == "assigned")
            .filter(Delivery.partner_id == None)
            .options(joinedload(Delivery.order))
        )
        return result.scalars().all()

delivery_repo = DeliveryRepository()
