from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.shop_repo import shop_repo
from app.repositories.product_repo import product_repo
from app.schemas.shop import ShopCreate, ShopUpdate
from app.schemas.product import ProductCreate
from app.models.user import UserRole, User
from app.models.shop import Shop
from app.models.product import Product

class ShopService:
    async def create_shop(self, db: AsyncSession, shop_in: ShopCreate, current_user: User) -> Shop:
        """Register a new shop under a certified Shop Owner."""
        if current_user.role != UserRole.SHOP_OWNER.value and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only registered Shop Owners can open a shop."
            )
        
        obj_in = {
            "name": shop_in.name,
            "description": shop_in.description,
            "logo_url": shop_in.logo_url,
            "owner_id": current_user.id
        }
        return await shop_repo.create(db, obj_in=obj_in)

    async def add_product_to_shop(self, db: AsyncSession, shop_id: str, product_in: ProductCreate, current_user: User) -> Product:
        """Add a new product catalog listing linked to the owner's shop."""
        shop = await shop_repo.get(db, shop_id)
        if not shop:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shop not found."
            )
        
        # Verify ownership
        if shop.owner_id != current_user.id and not current_user.is_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own this shop."
            )

        obj_in = product_in.model_dump()
        obj_in["shop_id"] = shop_id
        return await product_repo.create(db, obj_in=obj_in)

shop_service = ShopService()
