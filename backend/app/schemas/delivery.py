from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DeliveryCreate(BaseModel):
    order_id: str
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None

class DeliveryUpdate(BaseModel):
    partner_id: Optional[str] = None
    status: Optional[str] = None # assigned, picked_up, in_transit, delivered, failed
    actual_delivery: Optional[datetime] = None

class DeliveryResponse(BaseModel):
    id: str
    order_id: str
    partner_id: Optional[str] = None
    status: str
    tracking_number: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
