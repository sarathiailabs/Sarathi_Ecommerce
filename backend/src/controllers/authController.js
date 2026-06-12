import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import authService from '../services/authService.js';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

// In-memory password reset token store matching FastAPI's _reset_tokens dictionary
const resetTokens = new Map();

export const authController = {
  async register(req, res, next) {
    try {
      const { email, password, full_name, role } = req.body;
      if (!email || !password || !full_name) {
        return next(new AppError(400, 'Email, password, and full name are required.'));
      }
      const user = await authService.registerUser({ email, password, full_name, role });
      
      // Return FastAPI-like UserResponse format
      res.status(201).json({
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin,
        created_at: user.created_at
      });
    } catch (error) {
      next(error);
    }
  },

  async loginToken(req, res, next) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return next(new AppError(400, 'Username and password are required.'));
      }
      const token = await authService.authenticateUser(username, password);
      res.status(200).json(token);
    } catch (error) {
      next(error);
    }
  },

  async loginJson(req, res, next) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new AppError(400, 'Email and password are required.'));
      }
      const token = await authService.authenticateUser(email, password);
      res.status(200).json(token);
    } catch (error) {
      next(error);
    }
  },

  async getMe(req, res, next) {
    try {
      res.status(200).json({
        id: req.user.id,
        email: req.user.email,
        full_name: req.user.full_name,
        is_admin: req.user.is_admin,
        role: req.user.role,
        phone: req.user.phone,
        address: req.user.address,
        city: req.user.city,
        country: req.user.country,
        postal_code: req.user.postal_code,
        created_at: req.user.created_at
      });
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req, res, next) {
    try {
      const updates = req.body;
      const allowedUpdates = ['full_name', 'phone', 'address', 'city', 'country', 'postal_code'];
      const finalUpdates = {};

      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          finalUpdates[key] = updates[key];
        }
      }

      finalUpdates.updated_at = new Date().toISOString();

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(finalUpdates)
        .eq('id', req.user.id)
        .select('*')
        .single();

      if (error) {
        return next(new AppError(500, `Error updating user details: ${error.message}`));
      }

      res.status(200).json({
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        is_admin: updatedUser.is_admin,
        role: updatedUser.role,
        phone: updatedUser.phone,
        address: updatedUser.address,
        city: updatedUser.city,
        country: updatedUser.country,
        postal_code: updatedUser.postal_code,
        created_at: updatedUser.created_at
      });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      const { current_password, new_password } = req.body;
      if (!current_password || !new_password) {
        return next(new AppError(400, 'Current and new password are required.'));
      }

      const isPasswordValid = await bcrypt.compare(current_password, req.user.hashed_password);
      if (!isPasswordValid) {
        return next(new AppError(400, 'Current password is incorrect'));
      }

      if (new_password.length < 6) {
        return next(new AppError(400, 'New password must be at least 6 characters'));
      }

      const newHashed = await bcrypt.hash(new_password, 10);
      const { error } = await supabase
        .from('users')
        .update({
          hashed_password: newHashed,
          updated_at: new Date().toISOString()
        })
        .eq('id', req.user.id);

      if (error) {
        return next(new AppError(500, `Error updating password: ${error.message}`));
      }

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  },

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return next(new AppError(400, 'Email is required.'));
      }

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (user) {
        const token = uuidv4();
        resetTokens.set(token, {
          user_id: user.id,
          expires_at: Date.now() + 60 * 60 * 1000, // 1 hour
          used: false
        });

        // Always return reset token in dev/test for easy automation
        return res.status(200).json({
          message: 'If that email is registered, you will receive reset instructions.',
          reset_token: token,
          _dev_note: 'In production, this token would be sent via email only.'
        });
      }

      res.status(200).json({
        message: 'If that email is registered, you will receive reset instructions.'
      });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(req, res, next) {
    try {
      const { token, new_password } = req.body;
      if (!token || !new_password) {
        return next(new AppError(400, 'Token and new password are required.'));
      }

      const tokenData = resetTokens.get(token);
      if (!tokenData) {
        return next(new AppError(400, 'Invalid or expired reset token'));
      }

      if (tokenData.used) {
        return next(new AppError(400, 'Reset token has already been used'));
      }

      if (Date.now() > tokenData.expires_at) {
        return next(new AppError(400, 'Reset token has expired'));
      }

      if (new_password.length < 6) {
        return next(new AppError(400, 'Password must be at least 6 characters'));
      }

      // Mark token as used
      tokenData.used = true;

      // Update password
      const newHashed = await bcrypt.hash(new_password, 10);
      const { error } = await supabase
        .from('users')
        .update({
          hashed_password: newHashed,
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenData.user_id);

      if (error) {
        return next(new AppError(500, `Error updating user password: ${error.message}`));
      }

      res.status(200).json({
        message: 'Password reset successfully. You can now sign in with your new password.'
      });
    } catch (error) {
      next(error);
    }
  }
};

export default authController;
