from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from app.models.order import Order, OrderItem
from app.repositories.base import BaseRepository

class OrderRepository(BaseRepository[Order]):
    def __init__(self):
        super().__init__(Order)

    async def get_by_user_id(
        self, db: AsyncSession, user_id: str, *, skip: int = 0, limit: int = 100
    ) -> List[Order]:
        """Fetch orders for a customer utilizing eager loading for items to reduce N+1 queries."""
        result = await db.execute(
            select(Order)
            .filter(Order.user_id == user_id)
            .options(joinedload(Order.items).joinedload(OrderItem.product))
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().unique().all()

    async def get_orders_cursor(
        self, db: AsyncSession, user_id: str, *, cursor: Optional[datetime] = None, limit: int = 20
    ) -> List[Order]:
        """High-scale cursor pagination. Runs index seeks on created_at for O(1) performance on 10M+ rows."""
        query = (
            select(Order)
            .filter(Order.user_id == user_id)
            .options(joinedload(Order.items).joinedload(OrderItem.product))
            .order_by(Order.created_at.desc())
            .limit(limit)
        )
        if cursor:
            query = query.filter(Order.created_at < cursor)
        
        result = await db.execute(query)
        return result.scalars().unique().all()

    async def get_all_orders_paginated(
        self, db: AsyncSession, *, skip: int = 0, limit: int = 100
    ) -> List[Order]:
        """Admin helper to load orders globally across all customers."""
        result = await db.execute(
            select(Order)
            .options(joinedload(Order.items).joinedload(OrderItem.product))
            .order_by(Order.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().unique().all()

order_repo = OrderRepository()
