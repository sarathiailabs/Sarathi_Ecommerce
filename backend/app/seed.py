import asyncio
from sqlalchemy.future import select
from decimal import Decimal

from app.database import AsyncSessionLocal
from app.models import User, Product
from app.auth import get_password_hash

async def seed_data():
    async with AsyncSessionLocal() as db:
        # Check if database has users
        user_result = await db.execute(select(User).filter(User.email == "admin@example.com"))
        admin = user_result.scalars().first()

        if not admin:
            print("Seeding default admin user...")
            admin = User(
                email="admin@example.com",
                full_name="System Administrator",
                hashed_password=get_password_hash("Admin123@"),
                is_admin=True
            )
            db.add(admin)
        else:
            print("Admin user already exists.")

        # Check if products exist
        prod_result = await db.execute(select(Product))
        existing_products = prod_result.scalars().all()

        if not existing_products:
            print("Seeding products...")
            products = [
                Product(
                    name="Nova Sound Pro Wireless Headphones",
                    description="Experience high-fidelity audio with active noise cancellation, 40-hour battery life, and comfortable memory foam ear cups.",
                    price=Decimal("149.99"),
                    stock=100,
                    image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
                    category="Electronics"
                ),
                Product(
                    name="Titanium Smart Watch Series 5",
                    description="Advanced fitness tracking, heart rate monitor, sleep analysis, built-in GPS, and a beautiful always-on AMOLED display.",
                    price=Decimal("299.99"),
                    stock=75,
                    image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
                    category="Electronics"
                ),
                Product(
                    name="Ergonomic Office Chair",
                    description="Adjustable lumbar support, 3D armrests, breathable mesh back, and tilt lock mechanism for ultimate workspace comfort.",
                    price=Decimal("189.50"),
                    stock=60,
                    image_url="https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80",
                    category="Home Decor"
                ),
                Product(
                    name="Minimalist Leather Wallet",
                    description="Handcrafted top-grain leather wallet with RFID blocking technology, card slots, and an ultra-thin pocket profile.",
                    price=Decimal("45.00"),
                    stock=120,
                    image_url="/wallet.png",
                    category="Accessories"
                ),
                Product(
                    name="Urban Explorer Backpack",
                    description="Water-resistant shell, padded laptop compartment (up to 15.6\"), integrated USB charging port, and ergonomic shoulder straps.",
                    price=Decimal("85.00"),
                    stock=90,
                    image_url="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
                    category="Accessories"
                ),
                Product(
                    name="Classic Denim Jacket",
                    description="Premium heavy-duty denim construction, classic button-up front, dual chest pockets, and a timeless relaxed fit.",
                    price=Decimal("79.99"),
                    stock=110,
                    image_url="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80",
                    category="Fashion"
                ),
                Product(
                    name="Comfort Cushioned Running Shoes",
                    description="Lightweight breathable knit mesh upper with impact-absorbing foam midsole and high-traction rubber outsole.",
                    price=Decimal("120.00"),
                    stock=85,
                    image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
                    category="Footwear"
                ),
                Product(
                    name="Smart LED Desk Lamp",
                    description="Dimmable workspace lighting with 5 color modes, built-in wireless charging pad, USB output port, and auto-off timer.",
                    price=Decimal("35.99"),
                    stock=150,
                    image_url="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
                    category="Electronics"
                ),
                Product(
                    name="Stainless Steel Water Bottle",
                    description="Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof cap and BPA-free.",
                    price=Decimal("24.99"),
                    stock=200,
                    image_url="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80",
                    category="Accessories"
                ),
                Product(
                    name="Aromatherapy Oil Diffuser",
                    description="Ultra-quiet ultrasonic cool mist humidifier with 7 color LED lights, waterless auto-off safety feature, and 300ml capacity.",
                    price=Decimal("29.99"),
                    stock=130,
                    image_url="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80",
                    category="Home Decor"
                )
            ]
            db.add_all(products)
        else:
            print("Products already exist in the database.")

        await db.commit()
        print("Database seeding completed successfully.")

if __name__ == "__main__":
    asyncio.run(seed_data())
