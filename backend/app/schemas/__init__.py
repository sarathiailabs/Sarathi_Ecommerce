from app.schemas.user import Token, TokenData, UserBase, UserCreate, UserUpdate, UserResponse
from app.schemas.shop import ShopBase, ShopCreate, ShopUpdate, ShopResponse
from app.schemas.product import (
    ProductBase, ProductCreate, ProductUpdate, ProductResponse,
    CartItemCreate, CartItemResponse,
    ReviewCreate, ReviewUpdate, ReviewResponse,
    WishlistItemCreate, WishlistItemResponse,
    ProductVariantCreate, ProductVariantResponse,
    CouponCreate, CouponResponse, CouponValidate, CouponValidateResponse,
    ReturnCreate, ReturnResponse,
    ProductInventoryResponse
)
from app.schemas.order import OrderItemResponse, OrderResponse, OrderStatusUpdate, CheckoutRequest
from app.schemas.delivery import DeliveryCreate, DeliveryUpdate, DeliveryResponse
