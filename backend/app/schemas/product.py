from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- Product Schemas ---
class ProductBase(BaseModel):
    name: str
    description: str
    price: float = Field(gt=0)
    stock: int = Field(ge=0)
    image_url: str
    category: str


class ProductCreate(ProductBase):
    shop_id: Optional[str] = None
    original_price: Optional[float] = None
    subcategory: Optional[str] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    weight: Optional[float] = None
    dimensions: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    category: Optional[str] = None
    original_price: Optional[float] = None
    brand: Optional[str] = None
    is_featured: Optional[bool] = None


class ProductResponse(ProductBase):
    id: str
    shop_id: Optional[str] = None
    original_price: Optional[float] = None
    brand: Optional[str] = None
    rating: float
    review_count: int
    is_featured: bool
    is_active: bool

    class Config:
        from_attributes = True


# --- Cart Schemas ---
class CartItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)


class CartItemResponse(BaseModel):
    id: str
    product_id: str
    quantity: int
    product: ProductResponse

    class Config:
        from_attributes = True


# --- Review Schemas ---
class ReviewCreate(BaseModel):
    product_id: str
    rating: int = Field(ge=1, le=5)
    title: str = Field(min_length=5, max_length=255)
    comment: Optional[str] = Field(None, max_length=2000)


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    title: Optional[str] = None
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: str
    product_id: str
    user_id: str
    rating: int
    title: str
    comment: Optional[str]
    helpful_count: int
    verified_purchase: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Wishlist Schemas ---
class WishlistItemCreate(BaseModel):
    product_id: str


class WishlistItemResponse(BaseModel):
    id: str
    product_id: str
    product: ProductResponse
    created_at: datetime

    class Config:
        from_attributes = True


# --- Product Variant Schemas ---
class ProductVariantCreate(BaseModel):
    name: str
    value: str
    price_modifier: Optional[float] = 0
    stock: int = Field(ge=0)
    sku: Optional[str] = None


class ProductVariantResponse(BaseModel):
    id: str
    name: str
    value: str
    price_modifier: float
    stock: int
    sku: Optional[str]

    class Config:
        from_attributes = True


# --- Coupon Schemas ---
class CouponCreate(BaseModel):
    code: str = Field(min_length=3, max_length=50)
    description: Optional[str] = None
    discount_type: str = Field(pattern="^(percentage|fixed)$")
    discount_value: float = Field(gt=0)
    min_purchase_amount: Optional[float] = Field(0, ge=0)
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    usage_per_user: int = 1
    valid_from: datetime
    valid_until: datetime


class CouponResponse(BaseModel):
    id: str
    code: str
    description: Optional[str]
    discount_type: str
    discount_value: float
    min_purchase_amount: float
    usage_limit: Optional[int]
    is_active: bool
    valid_from: datetime
    valid_until: datetime

    class Config:
        from_attributes = True


class CouponValidate(BaseModel):
    code: str
    cart_total: float


class CouponValidateResponse(BaseModel):
    valid: bool
    discount_amount: float
    message: str


# --- Return/Refund Schemas ---
class ReturnCreate(BaseModel):
    order_id: str
    product_id: str
    quantity: int = Field(gt=0)
    reason: str
    description: Optional[str] = None


class ReturnResponse(BaseModel):
    id: str
    order_id: str
    user_id: str
    product_id: str
    quantity: int
    reason: str
    description: Optional[str]
    status: str
    refund_amount: float
    requested_at: datetime
    processed_at: Optional[datetime]

    class Config:
        from_attributes = True


# --- Product Inventory ---
class ProductInventoryResponse(BaseModel):
    id: str
    product_id: str
    warehouse_location: Optional[str]
    stock_quantity: int
    reorder_level: int
    last_restocked: Optional[datetime]

    class Config:
        from_attributes = True
