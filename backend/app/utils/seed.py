import asyncio
import random
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.future import select

from app.database import AsyncSessionLocal
from app.models import User, Product, Order, OrderItem, Review
from app.core.security import SecurityUtils

async def seed_data():
    async with AsyncSessionLocal() as db:
        print("--- DATABASE SEEDING STARTED ---")
        
        # 1. Seed admin users
        admin_emails = [
            ("admin@novacart.com", "admin123", "NovaCart Administrator"),
            ("admin@example.com", "AdminSecurePassword123!", "System Administrator")
        ]
        
        seeded_admins = []
        for email, pwd, name in admin_emails:
            user_result = await db.execute(select(User).filter(User.email == email))
            admin = user_result.scalars().first()
            if not admin:
                print(f"Seeding admin user: {email}...")
                admin = User(
                    email=email,
                    full_name=name,
                    hashed_password=SecurityUtils.hash_password(pwd),
                    is_admin=True
                )
                db.add(admin)
                await db.flush() # Populate ID
            seeded_admins.append(admin)
            
        # 2. Seed regular customers
        customer_data = [
            ("customer@novacart.com", "customer123", "Pratham User"),
            ("john@novacart.com", "john123", "John Doe"),
            ("jane@novacart.com", "jane123", "Jane Smith"),
            ("alex@novacart.com", "alex123", "Alex Mercer"),
            ("sara@novacart.com", "sara123", "Sara Williams"),
            ("mike@novacart.com", "mike123", "Mike Johnson")
        ]
        
        seeded_customers = []
        for email, pwd, name in customer_data:
            user_result = await db.execute(select(User).filter(User.email == email))
            cust = user_result.scalars().first()
            if not cust:
                print(f"Seeding customer user: {email}...")
                cust = User(
                    email=email,
                    full_name=name,
                    hashed_password=SecurityUtils.hash_password(pwd),
                    is_admin=False,
                    phone="+91 " + "".join([str(random.randint(0, 9)) for _ in range(10)]),
                    address=f"{random.randint(100, 999)} Main Street",
                    city=random.choice(["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai"]),
                    country="India",
                    postal_code="".join([str(random.randint(0, 9)) for _ in range(6)])
                )
                db.add(cust)
                await db.flush() # Populate ID
            seeded_customers.append(cust)

        # 3. Seed products (50+)
        prod_result = await db.execute(select(Product))
        existing_products = prod_result.scalars().all()

        products_list = []
        if not existing_products:
            print("Seeding products catalog (50+ products)...")
            raw_products = [
                # Electronics - 15 items
                Product(
                    name="Prathazon Sound Pro Wireless Headphones",
                    description="Experience high-fidelity audio with active noise cancellation, 40-hour battery life, and comfortable memory foam ear cups.",
                    price=Decimal("149.99"),
                    original_price=Decimal("199.99"),
                    stock=100,
                    image_url="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
                    category="Electronics",
                    brand="Prathazon",
                    rating=4.5,
                    review_count=128,
                    is_featured=True
                ),
                Product(
                    name="Titanium Smart Watch Series 5",
                    description="Advanced fitness tracking, heart rate monitor, sleep analysis, built-in GPS, and a beautiful always-on AMOLED display.",
                    price=Decimal("299.99"),
                    stock=75,
                    image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
                    category="Electronics",
                    brand="TechPro",
                    rating=4.7,
                    review_count=256,
                    is_featured=True
                ),
                Product(
                    name="Ultra HD 4K Webcam",
                    description="Professional 4K streaming camera with autofocus, stereo microphone, and wide-angle lens for crisp video calls.",
                    price=Decimal("89.99"),
                    stock=50,
                    image_url="https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80",
                    category="Electronics",
                    brand="StreamTech"
                ),
                Product(
                    name="Portable Phone Charger 20000mAh",
                    description="Fast charging power bank with dual USB ports and LED display. Charges phones 5 times faster.",
                    price=Decimal("34.99"),
                    stock=200,
                    image_url="https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&q=80",
                    category="Electronics",
                    brand="ChargePro"
                ),
                Product(
                    name="Bluetooth Portable Speaker",
                    description="360-degree surround sound with waterproof design, 12-hour battery, and deep bass technology.",
                    price=Decimal("59.99"),
                    stock=120,
                    image_url="https://images.unsplash.com/photo-1589003077984-894e133814c9?w=500&q=80",
                    category="Electronics",
                    brand="SoundMax"
                ),
                Product(
                    name="USB-C Hub 7-in-1",
                    description="Multi-port adapter with HDMI, USB 3.0, SD card reader, and charging capability. Perfect for laptops.",
                    price=Decimal("44.99"),
                    stock=90,
                    image_url="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&q=80",
                    category="Electronics",
                    brand="TechConnect"
                ),
                Product(
                    name="Wireless Charging Pad",
                    description="Fast 15W wireless charger compatible with all Qi-enabled devices. Non-slip rubber base.",
                    price=Decimal("29.99"),
                    stock=150,
                    image_url="https://images.unsplash.com/photo-1591156187615-2382e67ca560?w=500&q=80",
                    category="Electronics",
                    brand="ChargeWiz"
                ),
                Product(
                    name="Smart LED RGB Light Bulbs (Pack of 4)",
                    description="App-controlled smart bulbs with 16 million color options, voice control compatibility, and energy efficient.",
                    price=Decimal("49.99"),
                    original_price=Decimal("69.99"),
                    stock=80,
                    image_url="https://images.unsplash.com/photo-1565636192335-14c06305d2d7?w=500&q=80",
                    category="Electronics",
                    brand="LightSmart",
                    rating=4.3,
                    is_featured=True
                ),
                Product(
                    name="Mechanical Gaming Keyboard",
                    description="RGB backlit mechanical keyboard with cherry MX switches, aluminum frame, and customizable macros.",
                    price=Decimal("129.99"),
                    stock=60,
                    image_url="https://images.unsplash.com/photo-1587829191301-51231bcc1da5?w=500&q=80",
                    category="Electronics",
                    brand="GamePro"
                ),
                Product(
                    name="Precision Gaming Mouse",
                    description="16,000 DPI sensor, programmable buttons, ergonomic design, and lightweight for competitive gaming.",
                    price=Decimal("69.99"),
                    stock=100,
                    image_url="https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&q=80",
                    category="Electronics",
                    brand="GamePro"
                ),
                Product(
                    name="4K HDMI Cable Bundle (3-pack)",
                    description="Premium quality 4K@60Hz HDMI 2.0 cables with gold-plated connectors for interference-free transmission.",
                    price=Decimal("24.99"),
                    stock=200,
                    image_url="https://images.unsplash.com/photo-1621905167918-48416bd8575a?w=500&q=80",
                    category="Electronics",
                    brand="ConnectTech"
                ),
                Product(
                    name="Laptop Stand Adjustable",
                    description="Portable aluminum laptop stand with ergonomic height adjustment. Fits 11-17 inch laptops.",
                    price=Decimal("39.99"),
                    stock=110,
                    image_url="https://images.unsplash.com/photo-1587829191301-51231bcc1da5?w=500&q=80",
                    category="Electronics",
                    brand="WorkPro"
                ),
                Product(
                    name="USB C Docking Station",
                    description="All-in-one dock with 4K display output, fast charging, and multiple USB ports for productivity.",
                    price=Decimal("84.99"),
                    stock=45,
                    image_url="https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&q=80",
                    category="Electronics",
                    brand="TechConnect"
                ),
                Product(
                    name="Smart Home Security Camera",
                    description="1080p HD night vision, motion detection, two-way audio, and cloud storage. Voice assistant compatible.",
                    price=Decimal("99.99"),
                    original_price=Decimal("129.99"),
                    stock=55,
                    image_url="https://images.unsplash.com/photo-1579117343541-c6bc9c7f88b6?w=500&q=80",
                    category="Electronics",
                    brand="SecureView",
                    rating=4.6
                ),
                Product(
                    name="Smart Video Doorbell",
                    description="2K video, real-time alerts, two-way talk, and night vision. Integration with smart home systems.",
                    price=Decimal("119.99"),
                    stock=40,
                    image_url="https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=500&q=80",
                    category="Electronics",
                    brand="SecureView"
                ),

                # Home & Living - 15 items
                Product(
                    name="Ergonomic Office Chair",
                    description="Adjustable lumbar support, 3D armrests, breathable mesh back, and tilt lock mechanism for ultimate workspace comfort.",
                    price=Decimal("189.50"),
                    original_price=Decimal("249.99"),
                    stock=60,
                    image_url="https://images.unsplash.com/photo-1592078615290-033ee584e267?w=500&q=80",
                    category="Home & Living",
                    brand="ComfortSeating",
                    is_featured=True
                ),
                Product(
                    name="Smart LED Desk Lamp",
                    description="Dimmable workspace lighting with 5 color modes, built-in wireless charging pad, USB output port, and auto-off timer.",
                    price=Decimal("35.99"),
                    stock=150,
                    image_url="https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80",
                    category="Home & Living",
                    brand="LightSmart"
                ),
                Product(
                    name="Premium Bedding Set (Queen Size)",
                    description="1000 thread count Egyptian cotton with deep pockets. Includes 2 pillowcases and 1 fitted sheet.",
                    price=Decimal("149.99"),
                    stock=75,
                    image_url="https://images.unsplash.com/photo-1584622181563-430f63602d4b?w=500&q=80",
                    category="Home & Living",
                    brand="LuxeHome"
                ),
                Product(
                    name="Aromatherapy Oil Diffuser",
                    description="Ultra-quiet ultrasonic cool mist humidifier with 7 color LED lights, waterless auto-off safety feature, and 300ml capacity.",
                    price=Decimal("29.99"),
                    stock=130,
                    image_url="https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80",
                    category="Home & Living",
                    brand="AromaWell"
                ),
                Product(
                    name="Stainless Steel Cookware Set (10-Piece)",
                    description="Non-stick induction-ready cookware with heat-resistant handles and glass lids. Dishwasher safe.",
                    price=Decimal("129.99"),
                    stock=50,
                    image_url="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=500&q=80",
                    category="Home & Living",
                    brand="ChefsMaster"
                ),
                Product(
                    name="Memory Foam Pillow (Set of 2)",
                    description="Hypoallergenic memory foam pillows with temperature-regulating gel layer for comfortable sleep.",
                    price=Decimal("59.99"),
                    stock=100,
                    image_url="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&q=80",
                    category="Home & Living",
                    brand="SleepLux"
                ),
                Product(
                    name="Wooden Coffee Table",
                    description="Modern minimalist design with hidden storage compartment. Solid oak wood construction.",
                    price=Decimal("199.99"),
                    stock=30,
                    image_url="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",
                    category="Home & Living",
                    brand="ModernHome"
                ),
                Product(
                    name="Table Lamp with Shade",
                    description="Elegant fabric shade with energy-efficient LED bulb. Warm light perfect for living rooms.",
                    price=Decimal("45.99"),
                    stock=85,
                    image_url="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=500&q=80",
                    category="Home & Living",
                    brand="LuminaDecor"
                ),
                Product(
                    name="Storage Shelving Unit",
                    description="5-tier steel frame bookshelf with adjustable shelves. Perfect for organizing any room.",
                    price=Decimal("69.99"),
                    stock=70,
                    image_url="https://images.unsplash.com/photo-1572846095097-0f2aff3ba4ea?w=500&q=80",
                    category="Home & Living",
                    brand="OrganiSpace"
                ),
                Product(
                    name="Blackout Curtain Panels (Pair)",
                    description="Thermal insulated blackout curtains block 99% of light. Machine washable polyester fabric.",
                    price=Decimal("39.99"),
                    stock=120,
                    image_url="https://images.unsplash.com/photo-1598928506696-d697a41bde3b?w=500&q=80",
                    category="Home & Living",
                    brand="WindowDecor"
                ),
                Product(
                    name="Microfiber Bath Towels (Set of 4)",
                    description="Highly absorbent and quick-drying microfiber towels. Perfect for gym or daily use.",
                    price=Decimal("34.99"),
                    stock=140,
                    image_url="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=500&q=80",
                    category="Home & Living",
                    brand="ComfortPro"
                ),
                Product(
                    name="Door Mat Anti-Slip Rubber",
                    description="Heavy-duty rubber backing prevents slipping. Traps dirt and moisture effectively.",
                    price=Decimal("24.99"),
                    stock=180,
                    image_url="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&q=80",
                    category="Home & Living",
                    brand="HomeGuard"
                ),
                Product(
                    name="Desk Organizer with Drawers",
                    description="Bamboo desk organizer with 5 drawers for pens, papers, and office supplies.",
                    price=Decimal("32.99"),
                    stock=110,
                    image_url="https://images.unsplash.com/photo-1586578032616-2ef25652c35a?w=500&q=80",
                    category="Home & Living",
                    brand="OfficeNeat"
                ),
                Product(
                    name="Area Rug 5x8 ft",
                    description="Soft Persian-style area rug with non-slip backing. Adds elegance to any room.",
                    price=Decimal("89.99"),
                    stock=45,
                    image_url="https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=500&q=80",
                    category="Home & Living",
                    brand="RugArt"
                ),

                # Fashion & Accessories - 15 items
                Product(
                    name="Minimalist Leather Wallet",
                    description="Handcrafted top-grain leather wallet with RFID blocking technology, card slots, and an ultra-thin pocket profile.",
                    price=Decimal("45.00"),
                    stock=120,
                    image_url="https://images.unsplash.com/photo-1627124112126-89d132822f46?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="MinimalStyle",
                    is_featured=True
                ),
                Product(
                    name="Urban Explorer Backpack",
                    description="Water-resistant shell, padded laptop compartment (up to 15.6\"), integrated USB charging port, and ergonomic shoulder straps.",
                    price=Decimal("85.00"),
                    original_price=Decimal("119.99"),
                    stock=90,
                    image_url="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="UrbanGear"
                ),
                Product(
                    name="Classic Denim Jacket",
                    description="Premium heavy-duty denim construction, classic button-up front, dual chest pockets, and a timeless relaxed fit.",
                    price=Decimal("79.99"),
                    stock=110,
                    image_url="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="DenimPro"
                ),
                Product(
                    name="Stainless Steel Water Bottle",
                    description="Double-wall vacuum insulation keeps drinks cold for 24 hours or hot for 12 hours. Leak-proof cap and BPA-free.",
                    price=Decimal("24.99"),
                    stock=200,
                    image_url="https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="HydroKeep"
                ),
                Product(
                    name="Comfortable Running Shoes",
                    description="Lightweight breathable knit mesh upper with impact-absorbing foam midsole and high-traction rubber outsole.",
                    price=Decimal("120.00"),
                    original_price=Decimal("159.99"),
                    stock=85,
                    image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="RunFit"
                ),
                Product(
                    name="Wireless Bluetooth Sunglasses",
                    description="Polarized UV protection lenses with built-in bone conduction speaker for music and calls. Lightweight titanium frame.",
                    price=Decimal("149.99"),
                    stock=50,
                    image_url="https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="TechVision"
                ),
                Product(
                    name="Canvas Tote Bag",
                    description="Durable organic cotton canvas with reinforced handles. Perfect for shopping, work, or travel.",
                    price=Decimal("29.99"),
                    stock=140,
                    image_url="https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="EcoStyle"
                ),
                Product(
                    name="Leather Belt Premium",
                    description="Genuine Italian leather belt with solid brass buckle. Adjustable fit with lifetime stitching.",
                    price=Decimal("59.99"),
                    stock=95,
                    image_url="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="BeltCraft"
                ),
                Product(
                    name="Wool Beanie Hat",
                    description="Soft merino wool beanie with fleece lining for warmth and comfort. Available in 8 colors.",
                    price=Decimal("34.99"),
                    stock=160,
                    image_url="https://images.unsplash.com/photo-1578668481575-d0a1201be561?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="WinterWear"
                ),
                Product(
                    name="Stainless Steel Watch",
                    description="Automatic movement with sapphire crystal glass and water-resistant to 100M depth.",
                    price=Decimal("199.99"),
                    stock=40,
                    image_url="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="TimeClassic"
                ),
                Product(
                    name="Phone Crossbody Bag",
                    description="Compact leather crossbody bag perfect for carrying phone and essentials. Adjustable shoulder strap.",
                    price=Decimal("39.99"),
                    stock=85,
                    image_url="https://images.unsplash.com/photo-1548685528-6a5f5cf17af9?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="CrossCarry"
                ),
                Product(
                    name="Sports Socks Bundle (12-pack)",
                    description="Moisture-wicking athletic socks with arch support and cushioned sole. Machine washable.",
                    price=Decimal("24.99"),
                    stock=150,
                    image_url="https://images.unsplash.com/photo-1594859065100-95c9b10c0dd8?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="ActiveSport"
                ),
                Product(
                    name="UV Protected Hat",
                    description="Foldable wide-brim hat with UPF 50+ sun protection. Perfect for outdoor activities.",
                    price=Decimal("32.99"),
                    stock=120,
                    image_url="https://images.unsplash.com/photo-1541554403-3b38e68e87d5?w=500&q=80",
                    category="Fashion & Accessories",
                    brand="SunShade"
                ),

                # Sports & Fitness - 10 items
                Product(
                    name="Yoga Mat Premium Non-Slip",
                    description="6mm thick TPE yoga mat with carrying strap. Eco-friendly and machine washable.",
                    price=Decimal("49.99"),
                    stock=100,
                    image_url="https://images.unsplash.com/photo-1593357455193-6eae6b6e6d7b?w=500&q=80",
                    category="Sports & Fitness",
                    brand="YogaPro"
                ),
                Product(
                    name="Adjustable Dumbbell Set",
                    description="Adjustable from 5lbs to 25lbs per dumbbell. Compact design saves space with storage tray.",
                    price=Decimal("99.99"),
                    original_price=Decimal("149.99"),
                    stock=60,
                    image_url="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&q=80",
                    category="Sports & Fitness",
                    brand="FitForce",
                    is_featured=True
                ),
                Product(
                    name="Resistance Bands Set (5-pack)",
                    description="Color-coded resistance bands with different strengths plus carrying bag and guide.",
                    price=Decimal("29.99"),
                    stock=140,
                    image_url="https://images.unsplash.com/photo-1623874514416-e1e3b1f97e75?w=500&q=80",
                    category="Sports & Fitness",
                    brand="BandFit"
                ),
                Product(
                    name="Foam Roller Massage",
                    description="45cm high-density foam roller for muscle recovery and injury prevention. Textured surface.",
                    price=Decimal("39.99"),
                    stock=110,
                    image_url="https://images.unsplash.com/photo-1592478131143-6ac3a3b00e3b?w=500&q=80",
                    category="Sports & Fitness",
                    brand="RecoverFlow"
                ),
                Product(
                    name="Jump Rope Pro",
                    description="Speed jump rope with ball bearings and adjustable length. Perfect for cardio training.",
                    price=Decimal("24.99"),
                    stock=120,
                    image_url="https://images.unsplash.com/photo-1579546059649-a67a6eb85f4f?w=500&q=80",
                    category="Sports & Fitness",
                    brand="CardioMax"
                ),
                Product(
                    name="Gym Bag with Shoe Compartment",
                    description="Large capacity gym bag with separate shoe and wet compartments. Water-resistant material.",
                    price=Decimal("54.99"),
                    stock=80,
                    image_url="https://images.unsplash.com/photo-1553453861-90ac742371f7?w=500&q=80",
                    category="Sports & Fitness",
                    brand="GymGear"
                ),
                Product(
                    name="Water Resistant Sports Watch",
                    description="Digital sports watch with stopwatch, timer, and alarm. Water resistant up to 100 meters.",
                    price=Decimal("69.99"),
                    stock=95,
                    image_url="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
                    category="Sports & Fitness",
                    brand="SportTime"
                ),
                Product(
                    name="Push-up Bar Set",
                    description="Ergonomic push-up bars reduce wrist strain and increase range of motion. Non-slip handles.",
                    price=Decimal("34.99"),
                    stock=130,
                    image_url="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80",
                    category="Sports & Fitness",
                    brand="StrengthMax"
                ),
                Product(
                    name="Fitness Tracker Band",
                    description="Activity tracker with heart rate monitor, sleep tracking, and smartphone notifications.",
                    price=Decimal("89.99"),
                    stock=75,
                    image_url="https://images.unsplash.com/photo-1609290290569-33e8b1376b57?w=500&q=80",
                    category="Sports & Fitness",
                    brand="TrackFit"
                ),
            ]
            db.add_all(raw_products)
            await db.flush() # Populate IDs
            products_list = raw_products
            print(f"Seeded {len(products_list)} products.")
        else:
            print("Products already exist in the database.")
            products_list = existing_products

        # 4. Add sample reviews
        review_texts = [
            ("Amazing product! Exceeded my expectations.", 5),
            ("Great quality and fast shipping.", 5),
            ("Good value for the price.", 4),
            ("Works as described, very satisfied.", 4),
            ("Decent product but could be better.", 3),
            ("Not bad, but has some issues.", 3),
            ("Poor quality, disappointed.", 2),
            ("Exactly what I was looking for!", 5),
            ("Highly recommend!", 5),
            ("Good but a bit overpriced.", 3),
        ]
        
        # Add reviews to some products
        if seeded_customers and products_list[:10]:
            print("Adding sample product reviews...")
            for product in products_list[:10]:
                num_reviews = random.randint(2, 5)
                for _ in range(num_reviews):
                    review_text, rating = random.choice(review_texts)
                    review = Review(
                        product_id=product.id,
                        user_id=random.choice(seeded_customers).id,
                        rating=rating,
                        title=f"Review: {product.name}",
                        comment=review_text,
                        verified_purchase=True
                    )
                    db.add(review)

        # 5. Seed mock historical orders
        from sqlalchemy import delete
        await db.execute(delete(OrderItem))
        await db.execute(delete(Order))
        await db.commit()
        
        if seeded_customers and products_list:
            print("Seeding mock historical order data...")
            
            addresses = [
                "123 Luxury Villa, Sector 45, Gurgaon, HR",
                "Apartment 4B, Skyview Towers, HSR Layout, Bangalore, KA",
                "Flat 102, Ocean Pearl Residency, Marine Drive, Mumbai, MH",
                "Green Meadows House, Jubilee Hills, Hyderabad, TS",
                "Villa 9, Palm Grove Estate, ECR, Chennai, TN"
            ]
            
            phones = [
                "+91 98765 43210",
                "+91 87654 32109",
                "+91 76543 21098",
                "+91 91234 56789",
                "+91 99887 76655"
            ]
            
            payment_methods = ["card", "upi", "netbanking"]
            statuses = ["Delivered", "Delivered", "Delivered", "Shipped", "Pending"]
            
            now = datetime.utcnow()
            orders_created = 0
            
            for i in range(60):
                days_ago = random.randint(0, 30)
                hours_ago = random.randint(0, 23)
                minutes_ago = random.randint(0, 59)
                order_date = now - timedelta(days=days_ago, hours=hours_ago, minutes=minutes_ago)
                
                customer = random.choice(seeded_customers)
                
                order = Order(
                    user_id=customer.id,
                    total_amount=Decimal("0.00"),
                    status=random.choice(statuses),
                    shipping_address=random.choice(addresses),
                    customer_phone=random.choice(phones),
                    customer_name=customer.full_name,
                    payment_method=random.choice(payment_methods),
                    created_at=order_date
                )
                db.add(order)
                await db.flush()
                
                num_items = random.randint(1, 4)
                selected_products = random.sample(products_list, min(num_items, len(products_list)))
                total_val = Decimal("0.00")
                
                for prod in selected_products:
                    qty = random.randint(1, 3)
                    price = prod.price
                    subtotal = price * qty
                    total_val += subtotal
                    
                    order_item = OrderItem(
                        order_id=order.id,
                        product_id=prod.id,
                        quantity=qty,
                        price=price
                    )
                    db.add(order_item)
                
                order.total_amount = total_val
                orders_created += 1
            
            print(f"Successfully generated {orders_created} historical orders.")

        await db.commit()
        print("--- DATABASE SEEDING COMPLETED SUCCESSFULLY ---")
