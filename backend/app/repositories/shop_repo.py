from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.shop import Shop
from app.repositories.base import BaseRepository

class ShopRepository(BaseRepository[Shop]):
    def __init__(self):
        super().__init__(Shop)

    async def get_by_owner_id(self, db: AsyncSession, owner_id: str) -> List[Shop]:
        """Fetch all shops registered under a specific shop owner ID."""
        result = await db.execute(select(Shop).filter(Shop.owner_id == owner_id))
        return result.scalars().all()

shop_repo = ShopRepository()
