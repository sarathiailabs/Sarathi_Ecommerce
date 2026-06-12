import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const returnController = {
  async createReturn(req, res, next) {
    try {
      const { order_id, product_id, quantity, reason, description } = req.body;
      if (!order_id || !product_id || !quantity || !reason) {
        return next(new AppError(400, 'Order ID, product ID, quantity, and reason are required.'));
      }

      const qty = parseInt(quantity, 10);
      if (qty <= 0) {
        return next(new AppError(400, 'Quantity must be greater than 0.'));
      }

      // 1. Verify order exists and belongs to user
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('id', order_id)
        .single();

      if (orderErr || !order) {
        return next(new AppError(404, 'Order not found'));
      }

      if (order.user_id !== req.user.id) {
        return next(new AppError(403, 'Not authorized to return items from this order'));
      }

      // 2. Verify order item exists in that order
      const { data: orderItem, error: itemErr } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order_id)
        .eq('product_id', product_id)
        .single();

      if (itemErr || !orderItem) {
        return next(new AppError(404, 'Product not found in order'));
      }

      // 3. Verify quantity bounds
      if (qty > orderItem.quantity) {
        return next(new AppError(400, 'Return quantity exceeds ordered quantity'));
      }

      // 4. Calculate refund amount
      const refundAmount = parseFloat(orderItem.price) * qty;

      const returnId = uuidv4();
      const { data: returnReq, error: insertErr } = await supabase
        .from('returns')
        .insert({
          id: returnId,
          order_id,
          user_id: req.user.id,
          product_id,
          quantity: qty,
          reason,
          description,
          status: 'Pending',
          refund_amount: refundAmount,
          requested_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (insertErr) {
        return next(new AppError(500, `Error creating return request: ${insertErr.message}`));
      }

      res.status(201).json(returnReq);
    } catch (error) {
      next(error);
    }
  },

  async getReturns(req, res, next) {
    try {
      const { skip = '0', limit = '20' } = req.query;
      const skipNum = parseInt(skip, 10) || 0;
      const limitNum = parseInt(limit, 10) || 20;

      const { data: returns, error } = await supabase
        .from('returns')
        .select('*')
        .eq('user_id', req.user.id)
        .order('requested_at', { ascending: false })
        .range(skipNum, skipNum + limitNum - 1);

      if (error) {
        return next(new AppError(500, `Error fetching returns list: ${error.message}`));
      }

      res.status(200).json(returns || []);
    } catch (error) {
      next(error);
    }
  },

  async getReturn(req, res, next) {
    try {
      const { return_id } = req.params;

      const { data: returnReq, error } = await supabase
        .from('returns')
        .select('*')
        .eq('id', return_id)
        .single();

      if (error || !returnReq) {
        return next(new AppError(404, 'Return request not found'));
      }

      if (returnReq.user_id !== req.user.id && !req.user.is_admin) {
        return next(new AppError(403, 'Not authorized'));
      }

      res.status(200).json(returnReq);
    } catch (error) {
      next(error);
    }
  },

  async getAllReturns(req, res, next) {
    try {
      const { skip = '0', limit = '20' } = req.query;
      const skipNum = parseInt(skip, 10) || 0;
      const limitNum = parseInt(limit, 10) || 20;

      const { data: returns, error } = await supabase
        .from('returns')
        .select('*')
        .order('requested_at', { ascending: false })
        .range(skipNum, skipNum + limitNum - 1);

      if (error) {
        return next(new AppError(500, `Error loading returns: ${error.message}`));
      }

      res.status(200).json(returns || []);
    } catch (error) {
      next(error);
    }
  },

  async approveReturn(req, res, next) {
    try {
      const { return_id } = req.params;

      const { data: updated, error } = await supabase
        .from('returns')
        .update({ status: 'Approved' })
        .eq('id', return_id)
        .select('*')
        .single();

      if (error || !updated) {
        return next(new AppError(404, 'Return request not found'));
      }

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },

  async rejectReturn(req, res, next) {
    try {
      const { return_id } = req.params;

      const { data: updated, error } = await supabase
        .from('returns')
        .update({ status: 'Rejected' })
        .eq('id', return_id)
        .select('*')
        .single();

      if (error || !updated) {
        return next(new AppError(404, 'Return request not found'));
      }

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },

  async processRefund(req, res, next) {
    try {
      const { return_id } = req.params;

      const { data: returnReq, error: fetchErr } = await supabase
        .from('returns')
        .select('*')
        .eq('id', return_id)
        .single();

      if (fetchErr || !returnReq) {
        return next(new AppError(404, 'Return request not found'));
      }

      if (returnReq.status !== 'Approved') {
        return next(new AppError(400, 'Can only refund approved returns'));
      }

      const { data: updated, error: updateErr } = await supabase
        .from('returns')
        .update({
          status: 'Refunded',
          processed_at: new Date().toISOString()
        })
        .eq('id', return_id)
        .select('*')
        .single();

      if (updateErr) {
        return next(new AppError(500, `Error processing refund: ${updateErr.message}`));
      }

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  }
};

export default returnController;
