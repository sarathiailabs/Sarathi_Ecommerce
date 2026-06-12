import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const wishlistController = {
  async addToWishlist(req, res, next) {
    try {
      const { product_id } = req.body;
      if (!product_id) {
        return next(new AppError(400, 'Product ID is required.'));
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

      // 2. Check if already in wishlist
      const { data: existing } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('product_id', product_id)
        .maybeSingle();

      if (existing) {
        return next(new AppError(400, 'Product already in wishlist'));
      }

      const wishlistId = uuidv4();
      const { data: wishItem, error: insertErr } = await supabase
        .from('wishlists')
        .insert({
          id: wishlistId,
          user_id: req.user.id,
          product_id,
          created_at: new Date().toISOString()
        })
        .select('*, product:products(*)')
        .single();

      if (insertErr) {
        return next(new AppError(500, `Error adding to wishlist: ${insertErr.message}`));
      }

      res.status(201).json(wishItem);
    } catch (error) {
      next(error);
    }
  },

  async getWishlist(req, res, next) {
    try {
      const { skip = '0', limit = '20' } = req.query;
      const skipNum = parseInt(skip, 10) || 0;
      const limitNum = parseInt(limit, 10) || 20;

      const { data: items, error } = await supabase
        .from('wishlists')
        .select('*, product:products(*)')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
        .range(skipNum, skipNum + limitNum - 1);

      if (error) {
        return next(new AppError(500, `Error listing wishlist items: ${error.message}`));
      }

      res.status(200).json(items || []);
    } catch (error) {
      next(error);
    }
  },

  async removeFromWishlist(req, res, next) {
    try {
      const { product_id } = req.params;

      const { data: wishItem, error: fetchErr } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('product_id', product_id)
        .maybeSingle();

      if (fetchErr || !wishItem) {
        return next(new AppError(404, 'Item not in wishlist'));
      }

      const { error: deleteErr } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishItem.id);

      if (deleteErr) {
        return next(new AppError(500, `Error removing from wishlist: ${deleteErr.message}`));
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async checkInWishlist(req, res, next) {
    try {
      const { product_id } = req.params;

      const { data: item } = await supabase
        .from('wishlists')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('product_id', product_id)
        .maybeSingle();

      res.status(200).json({ in_wishlist: item !== null });
    } catch (error) {
      next(error);
    }
  },

  async clearWishlist(req, res, next) {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', req.user.id);

      if (error) {
        return next(new AppError(500, `Error clearing wishlist: ${error.message}`));
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

export default wishlistController;
