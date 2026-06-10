"""
Enhanced Products Router — B-H2
Adds full filtering, sorting, pagination, and search to GET /products.
This is the most critical API enhancement for automation testing:
every search/filter/sort test case depends on these query params.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import or_, and_, func

from app.database import get_db
from app.models import Product
from app.schemas import ProductResponse

router = APIRouter(prefix="/products", tags=["products"])


@router.get("", response_model=List[ProductResponse], summary="List products with full filtering, sorting & pagination")
async def list_products(
    # Search
    q: Optional[str] = Query(None, description="Full-text search across name, description, brand"),
    # Filters
    category: Optional[str] = Query(None, description="Filter by category"),
    brand: Optional[str] = Query(None, description="Filter by brand"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price"),
    featured: Optional[bool] = Query(None, description="Filter featured products only"),
    in_stock: Optional[bool] = Query(None, description="Filter only in-stock items"),
    # Sorting
    sort: Optional[str] = Query(
        "newest",
        description="Sort order: newest | price_asc | price_desc | rating | popular",
    ),
    # Pagination
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    limit: int = Query(20, ge=1, le=100, description="Results per page (max 100)"),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve a paginated, filtered, and sorted product list.

    ### Automation test scenarios this enables:
    - Search for a specific product by keyword
    - Filter by category (Electronics, Fashion, etc.)
    - Filter by price range
    - Sort ascending/descending by price
    - Paginate through large catalogs
    - Get featured products for homepage validation
    """
    stmt = select(Product).filter(Product.is_active == True)

    # ── Filters ─────────────────────────────────────────────────
    if q:
        term = f"%{q.lower()}%"
        stmt = stmt.filter(
            or_(
                func.lower(Product.name).like(term),
                func.lower(Product.description).like(term),
                func.lower(Product.brand).like(term),
                func.lower(Product.category).like(term),
            )
        )

    if category:
        stmt = stmt.filter(func.lower(Product.category) == category.lower())

    if brand:
        stmt = stmt.filter(func.lower(Product.brand) == brand.lower())

    if min_price is not None:
        stmt = stmt.filter(Product.price >= min_price)

    if max_price is not None:
        stmt = stmt.filter(Product.price <= max_price)

    if featured is not None:
        stmt = stmt.filter(Product.is_featured == featured)

    if in_stock is True:
        stmt = stmt.filter(Product.stock > 0)

    # ── Sorting ──────────────────────────────────────────────────
    sort_map = {
        "newest":     Product.created_at.desc(),
        "oldest":     Product.created_at.asc(),
        "price_asc":  Product.price.asc(),
        "price_desc": Product.price.desc(),
        "rating":     Product.rating.desc(),
        "popular":    Product.review_count.desc(),
    }
    order_clause = sort_map.get(sort, Product.created_at.desc())
    stmt = stmt.order_by(order_clause)

    # ── Pagination ───────────────────────────────────────────────
    offset = (page - 1) * limit
    stmt = stmt.offset(offset).limit(limit)

    result = await db.execute(stmt)
    products = result.scalars().all()
    return products


@router.get("/{product_id}", response_model=ProductResponse, summary="Get single product by ID")
async def get_product(product_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).filter(Product.id == product_id))
    product = result.scalars().first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product
