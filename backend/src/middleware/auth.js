import jwt from 'jsonwebtoken';
import settings from '../config/settings.js';
import supabase from '../db/supabase.js';
import { AppError } from './error.js';

export const get_current_user = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError(401, 'Could not validate credentials'));
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, settings.JWT_SECRET);
    } catch (err) {
      return next(new AppError(401, 'Could not validate credentials'));
    }

    const email = decoded.sub;
    if (!email) {
      return next(new AppError(401, 'Could not validate credentials'));
    }

    // Lookup user in Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return next(new AppError(401, 'Could not validate credentials'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(new AppError(401, 'Could not validate credentials'));
  }
};

export const get_current_admin = async (req, res, next) => {
  // Chain get_current_user logic if user is not loaded yet
  if (!req.user) {
    return get_current_user(req, res, (err) => {
      if (err) return next(err);
      checkAdmin(req, res, next);
    });
  }
  checkAdmin(req, res, next);
};

const checkAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return next(new AppError(403, 'The user does not have enough privileges'));
  }
  next();
};

export const get_current_shop_owner = async (req, res, next) => {
  if (!req.user) {
    return get_current_user(req, res, (err) => {
      if (err) return next(err);
      checkShopOwner(req, res, next);
    });
  }
  checkShopOwner(req, res, next);
};

const checkShopOwner = (req, res, next) => {
  if (req.user.role !== 'shop_owner' && !req.user.is_admin) {
    return next(new AppError(403, 'Only registered Shop Owners can perform this action.'));
  }
  next();
};

export const get_current_delivery_partner = async (req, res, next) => {
  if (!req.user) {
    return get_current_user(req, res, (err) => {
      if (err) return next(err);
      checkDeliveryPartner(req, res, next);
    });
  }
  checkDeliveryPartner(req, res, next);
};

const checkDeliveryPartner = (req, res, next) => {
  if (req.user.role !== 'delivery_partner' && !req.user.is_admin) {
    return next(new AppError(403, 'Only registered Delivery Partners can perform this action.'));
  }
  next();
};
