import { v4 as uuidv4 } from 'uuid';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const couponController = {
  async createCoupon(req, res, next) {
    try {
      const {
        code,
        description,
        discount_type,
        discount_value,
        min_purchase_amount,
        max_discount_amount,
        usage_limit,
        usage_per_user,
        valid_from,
        valid_until
      } = req.body;

      if (!code || !discount_type || discount_value === undefined || !valid_from || !valid_until) {
        return next(new AppError(400, 'Code, discount_type, discount_value, valid_from, and valid_until are required.'));
      }

      // 1. Check if coupon code already exists
      const upperCode = code.toUpperCase();
      const { data: existing } = await supabase
        .from('coupons')
        .select('id')
        .eq('code', upperCode)
        .maybeSingle();

      if (existing) {
        return next(new AppError(400, 'Coupon code already exists'));
      }

      // 2. Insert coupon
      const couponId = uuidv4();
      const { data: coupon, error: insertErr } = await supabase
        .from('coupons')
        .insert({
          id: couponId,
          code: upperCode,
          description,
          discount_type,
          discount_value,
          min_purchase_amount: min_purchase_amount || 0.00,
          max_discount_amount,
          usage_limit,
          usage_per_user: usage_per_user || 1,
          times_used: 0,
          is_active: true,
          valid_from,
          valid_until,
          created_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (insertErr) {
        return next(new AppError(500, `Error creating coupon: ${insertErr.message}`));
      }

      res.status(201).json(coupon);
    } catch (error) {
      next(error);
    }
  },

  async listCoupons(req, res, next) {
    try {
      const { skip = '0', limit = '20' } = req.query;
      const skipNum = parseInt(skip, 10) || 0;
      const limitNum = parseInt(limit, 10) || 20;

      const { data: coupons, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('is_active', true)
        .range(skipNum, skipNum + limitNum - 1);

      if (error) {
        return next(new AppError(500, `Error fetching active coupons: ${error.message}`));
      }

      res.status(200).json(coupons || []);
    } catch (error) {
      next(error);
    }
  },

  async validateCoupon(req, res, next) {
    try {
      const { code, cart_total } = req.body;
      if (!code || cart_total === undefined) {
        return next(new AppError(400, 'Code and cart_total are required.'));
      }

      const upperCode = code.toUpperCase();
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', upperCode)
        .maybeSingle();

      if (error || !coupon) {
        return res.status(200).json({
          valid: false,
          discount_amount: 0,
          message: 'Coupon code not found'
        });
      }

      if (!coupon.is_active) {
        return res.status(200).json({
          valid: false,
          discount_amount: 0,
          message: 'Coupon is inactive'
        });
      }

      // Check dates
      const now = new Date();
      const from = new Date(coupon.valid_from);
      const until = new Date(coupon.valid_until);

      if (now < from || now > until) {
        return res.status(200).json({
          valid: false,
          discount_amount: 0,
          message: 'Coupon is expired or not yet valid'
        });
      }

      // Check usage limits
      if (coupon.usage_limit && coupon.times_used >= coupon.usage_limit) {
        return res.status(200).json({
          valid: false,
          discount_amount: 0,
          message: 'Coupon usage limit exceeded'
        });
      }

      // Check minimum purchase
      const minAmount = parseFloat(coupon.min_purchase_amount);
      const totalAmount = parseFloat(cart_total);
      if (totalAmount < minAmount) {
        return res.status(200).json({
          valid: false,
          discount_amount: 0,
          message: `Minimum purchase amount required: $${coupon.min_purchase_amount}`
        });
      }

      // Calculate discount
      let discount = 0;
      const val = parseFloat(coupon.discount_value);
      if (coupon.discount_type === 'percentage') {
        discount = (totalAmount * val) / 100;
      } else {
        discount = val;
      }

      // Apply max discount constraint
      if (coupon.max_discount_amount) {
        const maxVal = parseFloat(coupon.max_discount_amount);
        discount = Math.min(discount, maxVal);
      }

      res.status(200).json({
        valid: true,
        discount_amount: parseFloat(discount.toFixed(2)),
        message: 'Coupon is valid'
      });
    } catch (error) {
      next(error);
    }
  },

  async updateCoupon(req, res, next) {
    try {
      const { coupon_id } = req.params;
      const updates = req.body;

      // Ensure uppercase code
      if (updates.code) {
        updates.code = updates.code.toUpperCase();
      }

      const { data: coupon, error: fetchErr } = await supabase
        .from('coupons')
        .select('*')
        .eq('id', coupon_id)
        .single();

      if (fetchErr || !coupon) {
        return next(new AppError(404, 'Coupon not found'));
      }

      const { data: updated, error: updateErr } = await supabase
        .from('coupons')
        .update(updates)
        .eq('id', coupon_id)
        .select('*')
        .single();

      if (updateErr) {
        return next(new AppError(500, `Error updating coupon: ${updateErr.message}`));
      }

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },

  async deleteCoupon(req, res, next) {
    try {
      const { coupon_id } = req.params;

      const { data: coupon, error: fetchErr } = await supabase
        .from('coupons')
        .select('id')
        .eq('id', coupon_id)
        .single();

      if (fetchErr || !coupon) {
        return next(new AppError(404, 'Coupon not found'));
      }

      const { error: deleteErr } = await supabase
        .from('coupons')
        .delete()
        .eq('id', coupon_id);

      if (deleteErr) {
        return next(new AppError(500, `Error deleting coupon: ${deleteErr.message}`));
      }

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};

export default couponController;
