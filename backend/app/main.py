from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.utils import seed_data
from app.routers import auth, products, cart, orders, admin, ai, reviews, wishlist, coupons, returns, shops, delivery
from app.routers import health as health_router, test_utils
from app.middleware.request_id import RequestIDMiddleware, ResponseTimingMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        print("Initializing database...")
        await init_db()
        print("Seeding database...")
        await seed_data()
    except Exception as e:
        print(f"Error during startup database operations: {e}")
    yield
    print("Stopping application...")

app = FastAPI(
    title="Prathazon Marketplace API",
    description="Enterprise-grade E-Commerce API — Automation Testing Playground",
    version="3.0.0",
    lifespan=lifespan
)

# ── Middleware (order matters — outermost first) ───────────────────────────────
app.add_middleware(ResponseTimingMiddleware)   # X-Response-Time header
app.add_middleware(RequestIDMiddleware)        # X-Request-ID header

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,     prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(cart.router,     prefix="/api")
app.include_router(orders.router,   prefix="/api")
app.include_router(admin.router,    prefix="/api")
app.include_router(ai.router,       prefix="/api")
app.include_router(reviews.router,  prefix="/api")
app.include_router(wishlist.router, prefix="/api")
app.include_router(coupons.router,  prefix="/api")
app.include_router(returns.router,  prefix="/api")
app.include_router(shops.router,    prefix="/api")
app.include_router(delivery.router, prefix="/api")
app.include_router(health_router.router)       # /health, /health/detailed
app.include_router(test_utils.router, prefix="/api")  # /api/test/* (dev only)

@app.get("/health", tags=["health"], include_in_schema=False)
async def health_check():
    return {"status": "healthy", "version": "3.0.0"}

