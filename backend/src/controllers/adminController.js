import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const adminController = {
  async createProduct(req, res, next) {
    try {
      const {
        name,
        description,
        price,
        original_price,
        stock,
        image_url,
        images,
        category,
        subcategory,
        brand,
        sku,
        weight,
        dimensions,
        is_featured,
        is_active
      } = req.body;

      if (!name || !description || price === undefined || stock === undefined || !image_url || !category) {
        return next(new AppError(400, 'Name, description, price, stock, image_url, and category are required.'));
      }

      const productId = uuidv4();
      const { data: product, error } = await supabase
        .from('products')
        .insert({
          id: productId,
          name,
          description,
          price,
          original_price,
          stock,
          image_url,
          images,
          category,
          subcategory,
          brand,
          sku,
          weight,
          dimensions,
          rating: 0.0,
          review_count: 0,
          is_featured: is_featured || false,
          is_active: is_active !== undefined ? is_active : true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        return next(new AppError(500, `Error creating product listing: ${error.message}`));
      }

      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  },

  async updateProduct(req, res, next) {
    try {
      const { product_id } = req.params;
      const updates = req.body;

      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('id')
        .eq('id', product_id)
        .single();

      if (fetchErr || !product) {
        return next(new AppError(404, 'Product not found'));
      }

      updates.updated_at = new Date().toISOString();

      const { data: updated, error: updateErr } = await supabase
        .from('products')
        .update(updates)
        .eq('id', product_id)
        .select('*')
        .single();

      if (updateErr) {
        return next(new AppError(500, `Error updating product details: ${updateErr.message}`));
      }

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteProduct(req, res, next) {
    try {
      const { product_id } = req.params;

      const { data: product, error: fetchErr } = await supabase
        .from('products')
        .select('id')
        .eq('id', product_id)
        .single();

      if (fetchErr || !product) {
        return next(new AppError(404, 'Product not found'));
      }

      const { error: deleteErr } = await supabase
        .from('products')
        .delete()
        .eq('id', product_id);

      if (deleteErr) {
        return next(new AppError(500, `Error deleting product: ${deleteErr.message}`));
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getAllOrders(req, res, next) {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(*))')
        .order('created_at', { ascending: false });

      if (error) {
        return next(new AppError(500, `Error loading all orders: ${error.message}`));
      }

      res.status(200).json(orders || []);
    } catch (error) {
      next(error);
    }
  },

  async updateOrderStatus(req, res, next) {
    try {
      const { order_id } = req.params;
      const { status } = req.body;

      if (!status) {
        return next(new AppError(400, 'Status is required.'));
      }

      const { data: order, error: fetchErr } = await supabase
        .from('orders')
        .select('id')
        .eq('id', order_id)
        .single();

      if (fetchErr || !order) {
        return next(new AppError(404, 'Order not found'));
      }

      const { data: updatedOrder, error: updateErr } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', order_id)
        .select('*, items:order_items(*, product:products(*))')
        .single();

      if (updateErr) {
        return next(new AppError(500, `Error updating order status: ${updateErr.message}`));
      }

      res.status(200).json(updatedOrder);
    } catch (error) {
      next(error);
    }
  }
};

export default adminController;
