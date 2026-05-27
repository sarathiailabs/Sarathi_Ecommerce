from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.seed import seed_data
from app.routers import auth, products, cart, orders, admin

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run startup events: create tables and seed mock data
    try:
        print("Initializing database...")
        await init_db()
        print("Seeding database...")
        await seed_data()
    except Exception as e:
        print(f"Error during startup database operations: {e}")
    yield
    # Run shutdown events:
    print("Stopping application...")

app = FastAPI(
    title="Nova Cart API",
    description="E-Commerce Full-Stack API built with FastAPI, Pydantic v2, and SQLAlchemy (Async)",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production environments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers with /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(cart.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(admin.router, prefix="/api")

@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}
