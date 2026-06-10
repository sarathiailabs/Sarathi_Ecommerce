from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.schemas.product import ProductResponse

# --- Order Schemas ---
class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    price: float
    product: ProductResponse

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    user_id: str
    total_amount: float
    status: str
    created_at: datetime
    items: List[OrderItemResponse]
    shipping_address: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_name: Optional[str] = None
    payment_method: Optional[str] = None

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: str


# --- Checkout Request ---
class CheckoutRequest(BaseModel):
    shipping_address: str
    phone: str
    full_name: str
    payment_method: str = "card"  # card | cod | upi | wallet
