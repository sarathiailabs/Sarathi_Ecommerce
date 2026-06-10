from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, get_read_db
from app.models.user import User
from app.schemas.delivery import DeliveryResponse, DeliveryUpdate
from app.core.dependencies import get_current_user
from app.services.delivery_service import delivery_service
from app.repositories.delivery_repo import delivery_repo

router = APIRouter(prefix="/deliveries", tags=["deliveries"])

@router.get("/unassigned", response_model=List[DeliveryResponse])
async def get_unassigned_shipments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_read_db)
):
    """Retrieve all pending orders awaiting a delivery partner dispatch assignment."""
    return await delivery_repo.get_unassigned_deliveries(db)

@router.get("/my", response_model=List[DeliveryResponse])
async def get_claimed_shipments(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_read_db)
):
    """Fetch all logistics items claimed by the active carrier agent."""
    return await delivery_repo.get_by_partner_id(db, current_user.id)

@router.post("/{delivery_id}/claim", response_model=DeliveryResponse)
async def claim_shipment(
    delivery_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Claim a pending dispatch delivery assignment as the current carrier partner."""
    return await delivery_service.claim_delivery(db, delivery_id, current_user)

@router.put("/{delivery_id}/status", response_model=DeliveryResponse)
async def update_shipment_status(
    delivery_id: str,
    update_in: DeliveryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update shipment progress (e.g. marked as picked up, in-transit, or completed)."""
    return await delivery_service.update_delivery_status(db, delivery_id, update_in, current_user)
