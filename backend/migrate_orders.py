"""
PostgreSQL migration: adds checkout columns to the orders table if they don't exist.
Run with:  .\\venv\\Scripts\\python.exe migrate_orders.py
"""
import asyncio
from sqlalchemy import text
from app.database import engine

NEW_COLUMNS = [
    ("shipping_address", "TEXT"),
    ("customer_phone",   "VARCHAR(20)"),
    ("customer_name",    "VARCHAR(255)"),
    ("payment_method",   "VARCHAR(50) DEFAULT 'card'"),
]

async def migrate():
    async with engine.begin() as conn:
        for col_name, col_type in NEW_COLUMNS:
            check_sql = text("""
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_name = 'orders' AND column_name = :col
            """)
            result = await conn.execute(check_sql, {"col": col_name})
            count = result.scalar()

            if count == 0:
                await conn.execute(
                    text(f"ALTER TABLE orders ADD COLUMN {col_name} {col_type}")
                )
                print("  [ADDED] " + col_name)
            else:
                print("  [EXISTS] " + col_name)

    print("Migration complete.")

if __name__ == "__main__":
    asyncio.run(migrate())
