"""
Enterprise-Grade E-Commerce Platform Backend
Version: 3.0 - Scalable Architecture with Express & Supabase
"""

# Backend folder structure
backend/
├── src/
│   ├── app.js                           # Express application entry point & router registration
│   ├── config/                          # Configuration management
│   │   └── settings.js                  # App settings loaded from environment variables
│   │
│   ├── db/                              # Database layer
│   │   └── supabase.js                  # Supabase client initialization
│   │
│   ├── controllers/                     # Route controllers (Request/Response logic)
│   │   ├── adminController.js           # Admin operations
│   │   ├── aiController.js              # AI assistant logic
│   │   ├── authController.js            # Authentication handlers
│   │   ├── cartController.js            # Cart management
│   │   ├── couponController.js          # Coupon & discount codes validation
│   │   ├── deliveryController.js        # Courier claimed shipment actions
│   │   ├── healthController.js          # Health status checks
│   │   ├── orderController.js           # Checkout and customer order histories
│   │   ├── productController.js         # Product retrieval and management
│   │   ├── returnController.js          # Refund and return processing
│   │   ├── reviewController.js          # Product reviews management
│   │   ├── shopController.js            # Shop owner details
│   │   ├── testController.js            # Testing sandbox controllers
│   │   └── wishlistController.js        # User wishlist actions
│   │
│   ├── middleware/                      # Express middleware layers
│   │   ├── auth.js                      # Authentication & token extraction (JWT validation)
│   │   ├── error.js                     # Global/Centralized error handlers
│   │   └── tracking.js                  # Ingress Request ID and Response Timing headers
│   │
│   ├── routes/                          # Express routers mapping endpoints
│   │   ├── admin.js                     # /api/admin/* routes
│   │   ├── ai.js                        # /api/ai/* routes
│   │   ├── auth.js                      # /api/auth/* routes
│   │   ├── cart.js                      # /api/cart/* routes
│   │   ├── coupons.js                   # /api/coupons/* routes
│   │   ├── delivery.js                  # /api/deliveries/* routes
│   │   ├── health.js                    # /health/detailed, health status
│   │   ├── orders.js                    # /api/orders/* routes
│   │   ├── products.js                  # /api/products/* routes
│   │   ├── returns.js                   # /api/returns/* routes
│   │   ├── reviews.js                   # /api/reviews/* routes
│   │   ├── shops.js                     # /api/shops/* routes
│   │   ├── testUtils.js                 # /api/test/* sandbox tools
│   │   └── wishlist.js                  # /api/wishlist/* routes
│   │
│   ├── services/                        # Business logic layer
│   │   ├── aiService.js                 # AI customer agent handling
│   │   ├── authService.js               # Auth actions & profile updates
│   │   ├── deliveryService.js           # Courier logistics
│   │   ├── orderService.js              # Stock inventory verification & checkout processing
│   │   └── shopService.js               # Shop profile updates
│   │
│   └── utils/                           # Utility scripts
│       └── seed.js                      # Supabase database seeder for products/orders/users
│
├── .env.example                         # Environment configuration placeholder
├── Dockerfile                           # Docker configuration (Node.js 20 base)
├── package.json                         # Node dependencies & dev scripts
└── package-lock.json                    # Lockfile for exact packages
