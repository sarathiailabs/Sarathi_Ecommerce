import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const cartController = {
  async getCart(req, res, next) {
    try {
      const { data: cartItems, error } = await supabase
        .from('carts')
        .select('*, product:products(*)')
        .eq('user_id', req.user.id);

      if (error) {
        return next(new AppError(500, `Error fetching cart items: ${error.message}`));
      }

      res.status(200).json(cartItems || []);
    } catch (error) {
      next(error);
    }
  },

  async addOrUpdateCartItem(req, res, next) {
    try {
      const { product_id, quantity } = req.body;
      if (!product_id || quantity === undefined) {
        return next(new AppError(400, 'Product ID and quantity are required.'));
      }

      const qty = parseInt(quantity, 10);
      if (qty <= 0) {
        return next(new AppError(400, 'Quantity must be greater than 0.'));
      }

      // 1. Check if product exists and check stock
      const { data: product, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('id', product_id)
        .single();

      if (prodErr || !product) {
        return next(new AppError(404, 'Product not found'));
      }

      if (product.stock < qty) {
        return next(new AppError(400, `Insufficient stock. Only ${product.stock} items available.`));
      }

      // 2. Check if item is already in cart
      const { data: cartItem, error: cartErr } = await supabase
        .from('carts')
        .select('*')
        .eq('user_id', req.user.id)
        .eq('product_id', product_id)
        .maybeSingle();

      let savedItem;

      if (cartItem) {
        // Update quantity
        const { data, error } = await supabase
          .from('carts')
          .update({ quantity: qty })
          .eq('id', cartItem.id)
          .select('*, product:products(*)')
          .single();

        if (error) {
          return next(new AppError(500, `Error updating cart item quantity: ${error.message}`));
        }
        savedItem = data;
      } else {
        // Add new item
        const newId = uuidv4();
        const { data, error } = await supabase
          .from('carts')
          .insert({
            id: newId,
            user_id: req.user.id,
            product_id,
            quantity: qty
          })
          .select('*, product:products(*)')
          .single();

        if (error) {
          return next(new AppError(500, `Error adding item to cart: ${error.message}`));
        }
        savedItem = data;
      }

      res.status(200).json(savedItem);
    } catch (error) {
      next(error);
    }
  },

  async removeCartItem(req, res, next) {
    try {
      const { product_id } = req.params;
      
      const { data: cartItem, error: fetchErr } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', req.user.id)
        .eq('product_id', product_id)
        .maybeSingle();

      if (fetchErr || !cartItem) {
        return next(new AppError(404, 'Item not found in cart'));
      }

      const { error: deleteErr } = await supabase
        .from('carts')
        .delete()
        .eq('id', cartItem.id);

      if (deleteErr) {
        return next(new AppError(500, `Error deleting cart item: ${deleteErr.message}`));
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

export default cartController;
