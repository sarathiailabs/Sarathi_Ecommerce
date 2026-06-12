import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import settings from '../config/settings.js';
import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

export const authService = {
  async registerUser({ email, password, full_name, role = 'customer' }) {
    // 1. Check if email already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new AppError(400, 'A user with this email already exists.');
    }

    // 2. Validate role
    const validRoles = ['customer', 'shop_owner', 'delivery_partner', 'admin'];
    const lowerRole = role.toLowerCase();
    if (!validRoles.includes(lowerRole)) {
      throw new AppError(400, `Invalid registration role: ${role}`);
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // 4. Create user
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        hashed_password: hashedPassword,
        full_name,
        role: lowerRole,
        is_admin: lowerRole === 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single();

    if (error) {
      throw new AppError(500, `Error creating user: ${error.message}`);
    }

    return user;
  },

  async authenticateUser(email, password) {
    // 1. Fetch user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new AppError(401, 'Incorrect email or password');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(password, user.hashed_password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Incorrect email or password');
    }

    // 3. Generate token
    const tokenData = {
      sub: user.email,
      is_admin: user.is_admin,
      role: user.role
    };

    const accessToken = jwt.sign(tokenData, settings.JWT_SECRET, {
      expiresIn: `${settings.ACCESS_TOKEN_EXPIRE_MINUTES}m`
    });

    return {
      access_token: accessToken,
      token_type: 'bearer'
    };
  }
};

export default authService;
