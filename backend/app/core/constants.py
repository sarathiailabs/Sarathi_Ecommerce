"""
Core constants for the enterprise application
Centralized configuration values
"""

# User roles
class UserRole:
    CUSTOMER = "customer"
    ADMIN = "admin"
    SHOP_OWNER = "shop_owner"
    DELIVERY_AGENT = "delivery_agent"
    DELIVERY_COMPANY_ADMIN = "delivery_company_admin"
    
    ALL_ROLES = [
        CUSTOMER,
        ADMIN,
        SHOP_OWNER,
        DELIVERY_AGENT,
        DELIVERY_COMPANY_ADMIN
    ]

# Order statuses
class OrderStatus:
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"
    
    ALL_STATUSES = [
        PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED
    ]

# Payment statuses
class PaymentStatus:
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"
    
    ALL_STATUSES = [PENDING, COMPLETED, FAILED, REFUNDED, CANCELLED]

# Delivery statuses
class DeliveryStatus:
    PENDING = "pending"
    ASSIGNED = "assigned"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    FAILED = "failed"
    RETURNED = "returned"
    
    ALL_STATUSES = [
        PENDING, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED, RETURNED
    ]

# Return statuses
class ReturnStatus:
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REFUNDED = "refunded"
    
    ALL_STATUSES = [PENDING, APPROVED, REJECTED, REFUNDED]

# Product categories
class ProductCategory:
    ELECTRONICS = "Electronics"
    HOME_LIVING = "Home & Living"
    FASHION_ACCESSORIES = "Fashion & Accessories"
    SPORTS_FITNESS = "Sports & Fitness"
    BOOKS_MEDIA = "Books & Media"
    TOYS_GAMES = "Toys & Games"
    BEAUTY_HEALTH = "Beauty & Health"
    GROCERY_FOOD = "Grocery & Food"
    
    ALL_CATEGORIES = [
        ELECTRONICS,
        HOME_LIVING,
        FASHION_ACCESSORIES,
        SPORTS_FITNESS,
        BOOKS_MEDIA,
        TOYS_GAMES,
        BEAUTY_HEALTH,
        GROCERY_FOOD
    ]

# Coupon types
class CouponType:
    PERCENTAGE = "percentage"
    FIXED = "fixed"
    FREE_SHIPPING = "free_shipping"
    
    ALL_TYPES = [PERCENTAGE, FIXED, FREE_SHIPPING]

# Return reasons
class ReturnReason:
    DEFECTIVE = "defective"
    NOT_AS_DESCRIBED = "not_as_described"
    DAMAGED = "damaged"
    CHANGED_MIND = "changed_mind"
    BETTER_PRICE = "better_price"
    
    ALL_REASONS = [DEFECTIVE, NOT_AS_DESCRIBED, DAMAGED, CHANGED_MIND, BETTER_PRICE]

# Notification types
class NotificationType:
    ORDER_CONFIRMATION = "order_confirmation"
    ORDER_SHIPPED = "order_shipped"
    ORDER_DELIVERED = "order_delivered"
    PAYMENT_RECEIVED = "payment_received"
    REFUND_INITIATED = "refund_initiated"
    RETURN_APPROVED = "return_approved"
    PROMOTIONAL = "promotional"
    
    ALL_TYPES = [
        ORDER_CONFIRMATION, ORDER_SHIPPED, ORDER_DELIVERED,
        PAYMENT_RECEIVED, REFUND_INITIATED, RETURN_APPROVED, PROMOTIONAL
    ]

# Cache keys
class CacheKeys:
    PRODUCT_DETAILS = "product:{id}"
    PRODUCT_LIST = "products:page:{page}"
    USER_PROFILE = "user:{id}"
    CART_ITEMS = "cart:{user_id}"
    ORDER_DETAILS = "order:{id}"
    COUPON_DETAILS = "coupon:{code}"
    
    # Cache TTL (in seconds)
    DEFAULT_TTL = 3600  # 1 hour
    PRODUCT_TTL = 7200  # 2 hours
    CART_TTL = 1800  # 30 minutes

# Pagination defaults
class Pagination:
    DEFAULT_PAGE_SIZE = 20
    MAX_PAGE_SIZE = 100
    MIN_PAGE_SIZE = 1

# File upload limits
class FileUpload:
    MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB
    MAX_DOCUMENT_SIZE = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif"]
    ALLOWED_DOCUMENT_TYPES = ["application/pdf", "application/msword"]
