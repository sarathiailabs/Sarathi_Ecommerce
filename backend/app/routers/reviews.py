from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import Review, Product, User
from app.schemas import ReviewCreate, ReviewResponse, ReviewUpdate
from app.core.dependencies import get_current_user
from typing import List

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("/{product_id}", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    product_id: str,
    review: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new review for a product"""
    # Check if product exists
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    
    # Check if user already reviewed this product
    result = await db.execute(
        select(Review).where(
            (Review.product_id == product_id) & (Review.user_id == current_user.id)
        )
    )
    existing_review = result.scalar_one_or_none()
    if existing_review:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You already reviewed this product")
    
    new_review = Review(
        product_id=product_id,
        user_id=current_user.id,
        rating=review.rating,
        title=review.title,
        comment=review.comment,
        verified_purchase=True
    )
    
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    
    # Update product rating
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.product_id == product_id)
    )
    avg_rating, count = result.one()
    product.rating = float(avg_rating) if avg_rating else 0.0
    product.review_count = count
    await db.commit()
    
    return new_review


@router.get("/product/{product_id}", response_model=List[ReviewResponse])
async def get_product_reviews(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """Get all reviews for a product"""
    result = await db.execute(
        select(Review)
        .where(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    reviews = result.scalars().all()
    return reviews


@router.put("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_update: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a review (only by the creator)"""
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    if review.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this review")
    
    if review_update.rating:
        review.rating = review_update.rating
    if review_update.title:
        review.title = review_update.title
    if review_update.comment is not None:
        review.comment = review_update.comment
    
    await db.commit()
    await db.refresh(review)
    
    # Update product rating
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.product_id == review.product_id)
    )
    avg_rating, count = result.one()
    product = await db.execute(select(Product).where(Product.id == review.product_id))
    prod = product.scalar_one()
    prod.rating = float(avg_rating) if avg_rating else 0.0
    prod.review_count = count
    await db.commit()
    
    return review


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a review (only by the creator)"""
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    if review.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this review")
    
    product_id = review.product_id
    await db.delete(review)
    await db.commit()
    
    # Update product rating
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id)).where(Review.product_id == product_id)
    )
    avg_rating, count = result.one()
    product = await db.execute(select(Product).where(Product.id == product_id))
    prod = product.scalar_one()
    prod.rating = float(avg_rating) if avg_rating else 0.0
    prod.review_count = count
    await db.commit()


@router.post("/{review_id}/helpful", status_code=status.HTTP_200_OK)
async def mark_helpful(
    review_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a review as helpful"""
    result = await db.execute(select(Review).where(Review.id == review_id))
    review = result.scalar_one_or_none()
    
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    
    review.helpful_count += 1
    await db.commit()
    
    return {"message": "Review marked as helpful", "helpful_count": review.helpful_count}
