from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_
from app.models.product import Product, ProductInventory
from app.repositories.base import BaseRepository

class ProductRepository(BaseRepository[Product]):
    def __init__(self):
        super().__init__(Product)

    async def get_by_category(self, db: AsyncSession, category: str, *, skip: int = 0, limit: int = 100) -> List[Product]:
        """List active products within a specific category."""
        result = await db.execute(
            select(Product)
            .filter(and_(Product.category == category, Product.is_active == True))
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()

    async def get_low_stock_alerts(self, db: AsyncSession) -> List[ProductInventory]:
        """Fetch all warehouse items where actual inventory has fallen below reorder levels."""
        result = await db.execute(
            select(ProductInventory)
            .filter(ProductInventory.stock_quantity <= ProductInventory.reorder_level)
        )
        return result.scalars().all()

product_repo = ProductRepository()
