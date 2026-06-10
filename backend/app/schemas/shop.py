from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ShopBase(BaseModel):
    name: str
    description: Optional[str] = None
    logo_url: Optional[str] = None

class ShopCreate(ShopBase):
    pass

class ShopUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None

class ShopResponse(ShopBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
