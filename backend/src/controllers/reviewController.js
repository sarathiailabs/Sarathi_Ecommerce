import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

async function recalculateProductRating(productId) {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('product_id', productId);

  const count = reviews ? reviews.length : 0;
  const average = count > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / count) : 0.0;

  await supabase
    .from('products')
    .update({
      rating: parseFloat(average.toFixed(1)),
      review_count: count
    })
    .eq('id', productId);
}

export const reviewController = {
  async createReview(req, res, next) {
    try {
      const { product_id } = req.params;
      const { rating, title, comment } = req.body;

      if (rating === undefined || !title) {
        return next(new AppError(400, 'Rating and title are required.'));
      }

      const ratingNum = parseInt(rating, 10);
      if (ratingNum < 1 || ratingNum > 5) {
        return next(new AppError(400, 'Rating must be between 1 and 5.'));
      }

      // 1. Check if product exists
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('id')
        .eq('id', product_id)
        .single();

      if (prodErr || !product) {
        return next(new AppError(404, 'Product not found'));
      }

      // 2. Check if user already reviewed this product
      const { data: existing } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', product_id)
        .eq('user_id', req.user.id)
        .maybeSingle();

      if (existing) {
        return next(new AppError(400, 'You already reviewed this product'));
      }

      // 3. Create review
      const reviewId = uuidv4();
      const { data: review, error: insertErr } = await supabase
        .from('reviews')
        .insert({
          id: reviewId,
          product_id,
          user_id: req.user.id,
          rating: ratingNum,
          title,
          comment,
          helpful_count: 0,
          verified_purchase: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (insertErr) {
        return next(new AppError(500, `Error submitting review: ${insertErr.message}`));
      }

      // 4. Update product rating stats
      await recalculateProductRating(product_id);

      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  },

  async getProductReviews(req, res, next) {
    try {
      const { product_id } = req.params;
      const { skip = '0', limit = '10' } = req.query;

      const skipNum = parseInt(skip, 10) || 0;
      const limitNum = parseInt(limit, 10) || 10;

      const { data: reviews, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('product_id', product_id)
        .order('created_at', { ascending: false })
        .range(skipNum, skipNum + limitNum - 1);

      if (error) {
        return next(new AppError(500, `Error listing reviews: ${error.message}`));
      }

      res.status(200).json(reviews || []);
    } catch (error) {
      next(error);
    }
  },

  async updateReview(req, res, next) {
    try {
      const { review_id } = req.params;
      const { rating, title, comment } = req.body;

      // 1. Fetch review
      const { data: review, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', review_id)
        .single();

      if (error || !review) {
        return next(new AppError(404, 'Review not found'));
      }

      // 2. Authorize
      if (review.user_id !== req.user.id) {
        return next(new AppError(403, 'Not authorized to update this review'));
      }

      const updates = {
        updated_at: new Date().toISOString()
      };

      if (rating !== undefined) {
        updates.rating = parseInt(rating, 10);
      }
      if (title !== undefined) {
        updates.title = title;
      }
      if (comment !== undefined) {
        updates.comment = comment;
      }

      // 3. Update review
      const { data: updatedReview, error: updateErr } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', review_id)
        .select('*')
        .single();

      if (updateErr) {
        return next(new AppError(500, `Error updating review: ${updateErr.message}`));
      }

      // 4. Recalculate
      await recalculateProductRating(review.product_id);

      res.status(200).json(updatedReview);
    } catch (error) {
      next(error);
    }
  },

  async deleteReview(req, res, next) {
    try {
      const { review_id } = req.params;

      const { data: review, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('id', review_id)
        .single();

      if (error || !review) {
        return next(new AppError(404, 'Review not found'));
      }

      if (review.user_id !== req.user.id) {
        return next(new AppError(403, 'Not authorized to delete this review'));
      }

      const { error: deleteErr } = await supabase
        .from('reviews')
        .delete()
        .eq('id', review_id);

      if (deleteErr) {
        return next(new AppError(500, `Error deleting review: ${deleteErr.message}`));
      }

      await recalculateProductRating(review.product_id);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async markHelpful(req, res, next) {
    try {
      const { review_id } = req.params;

      const { data: review, error } = await supabase
        .from('reviews')
        .select('helpful_count')
        .eq('id', review_id)
        .single();

      if (error || !review) {
        return next(new AppError(404, 'Review not found'));
      }

      const newHelpfulCount = (review.helpful_count || 0) + 1;
      const { error: updateErr } = await supabase
        .from('reviews')
        .update({ helpful_count: newHelpfulCount })
        .eq('id', review_id);

      if (updateErr) {
        return next(new AppError(500, `Error updating helpful count: ${updateErr.message}`));
      }

      res.status(200).json({
        message: 'Review marked as helpful',
        helpful_count: newHelpfulCount
      });
    } catch (error) {
      next(error);
    }
  }
};

export default reviewController;
