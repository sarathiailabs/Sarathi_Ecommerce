import orderService from '../services/orderService.js';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const orderController = {
  async checkout(req, res, next) {
    try {
      const { shipping_address, phone, full_name, payment_method } = req.body;
      if (!shipping_address || !phone || !full_name) {
        return next(new AppError(400, 'Shipping address, phone number, and full name are required.'));
      }

      const order = await orderService.placeOrder({
        shipping_address,
        phone,
        full_name,
        payment_method
      }, req.user);

      res.status(201).json(order);
    } catch (error) {
      next(error);
    }
  },

  async getOrderHistory(req, res, next) {
    try {
      const { cursor, limit = '20' } = req.query;
      const limitNum = parseInt(limit, 10) || 20;

      let query = supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(*))')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
        .limit(limitNum);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data: orders, error } = await query;

      if (error) {
        return next(new AppError(500, `Error fetching order history: ${error.message}`));
      }

      // Eager loaded returns may create duplicate row keys if standard arrays are not cleaned,
      // but Supabase select with nested arrays handles list arrays natively.
      res.status(200).json(orders || []);
    } catch (error) {
      next(error);
    }
  },

  async getOrderById(req, res, next) {
    try {
      const { order_id } = req.params;

      const { data: order, error } = await supabase
        .from('orders')
        .select('*, items:order_items(*, product:products(*))')
        .eq('id', order_id)
        .single();

      if (error || !order) {
        return next(new AppError(404, 'Order not found'));
      }

      // Authorization: customers can only view their own orders
      if (!req.user.is_admin && order.user_id !== req.user.id) {
        return next(new AppError(403, 'You are not authorized to view this order'));
      }

      res.status(200).json(order);
    } catch (error) {
      next(error);
    }
  },

  async cancelOrder(req, res, next) {
    try {
      const { order_id } = req.params;
      const { reason } = req.body;

      const updatedOrder = await orderService.cancelOrder(order_id, req.user);

      res.status(200).json({
        message: 'Order cancelled successfully',
        order_id,
        reason: reason || 'Customer requested cancellation',
        status: 'Cancelled'
      });
    } catch (error) {
      next(error);
    }
  }
};

export default orderController;
