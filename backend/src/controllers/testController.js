import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import settings from '../config/settings.js';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

const checkTestEnv = () => {
  if (settings.ENVIRONMENT === 'production') {
    throw new AppError(403, 'Test utilities are disabled in production');
  }
};

export const testController = {
  async createTestUser(req, res, next) {
    try {
      checkTestEnv();

      const { email, password, full_name = 'Test User', role = 'customer' } = req.body;
      if (!email || !password) {
        return next(new AppError(400, 'Email and password are required.'));
      }

      const lowerRole = role.toLowerCase();
      const validRoles = ['customer', 'shop_owner', 'delivery_partner', 'admin'];
      if (!validRoles.includes(lowerRole)) {
        return next(new AppError(400, `Invalid role: ${role}`));
      }

      // Check if email already exists
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        return next(new AppError(400, 'Email already in use'));
      }

      // Hash password and insert user
      const hashed = await bcrypt.hash(password, 10);
      const userId = uuidv4();

      const { data: user, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          email,
          hashed_password: hashed,
          full_name,
          role: lowerRole,
          is_admin: lowerRole === 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        return next(new AppError(500, `Error creating test user: ${error.message}`));
      }

      // Generate JWT access token instantly
      const tokenData = {
        sub: user.email,
        is_admin: user.is_admin,
        role: user.role
      };

      const accessToken = jwt.sign(tokenData, settings.JWT_SECRET, {
        expiresIn: `${settings.ACCESS_TOKEN_EXPIRE_MINUTES}m`
      });

      res.status(201).json({
        id: userId,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        access_token: accessToken
      });
    } catch (error) {
      next(error);
    }
  },

  async resetTestData(req, res, next) {
    try {
      checkTestEnv();

      // Delete in proper dependency order
      // 1. Delete returns
      await supabase.from('returns').delete().neq('id', 'none');
      // 2. Delete deliveries
      await supabase.from('deliveries').delete().neq('id', 'none');
      // 3. Delete order_items
      await supabase.from('order_items').delete().neq('id', 'none');
      // 4. Delete orders
      await supabase.from('orders').delete().neq('id', 'none');
      // 5. Delete carts
      await supabase.from('carts').delete().neq('id', 'none');
      // 6. Delete reviews
      await supabase.from('reviews').delete().neq('id', 'none');
      // 7. Delete wishlists
      await supabase.from('wishlists').delete().neq('id', 'none');

      // 8. Delete non-seeded users (preserve seed accounts)
      await supabase
        .from('users')
        .delete()
        .filter('email', 'not.in', '(admin@novacart.com,customer@novacart.com,seller@novacart.com,delivery@novacart.com)');

      res.status(200).json({
        message: 'Test data reset successfully',
        preserved_accounts: [
          'admin@novacart.com',
          'customer@novacart.com',
          'seller@novacart.com',
          'delivery@novacart.com'
        ]
      });
    } catch (error) {
      next(error);
    }
  },

  async listFixtures(req, res, next) {
    try {
      checkTestEnv();

      res.status(200).json({
        fixtures: [
          { name: 'customer', email: 'customer@novacart.com', password: 'customer123', role: 'customer' },
          { name: 'admin',    email: 'admin@novacart.com',    password: 'admin123',    role: 'admin' },
          { name: 'seller',   email: 'seller@novacart.com',   password: 'seller123',   role: 'shop_owner' },
          { name: 'delivery', email: 'delivery@novacart.com', password: 'delivery123', role: 'delivery_partner' }
        ],
        endpoints: {
          create_user: 'POST /api/test/create-user',
          reset:       'POST /api/test/reset',
          fixtures:    'GET  /api/test/fixtures'
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

export default testController;
