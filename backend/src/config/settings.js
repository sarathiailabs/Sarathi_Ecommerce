import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config();

const settings = {
  PORT: process.env.PORT || 8000,
  ENVIRONMENT: process.env.ENVIRONMENT || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-change-in-production-123456',
  JWT_ALGORITHM: process.env.JWT_ALGORITHM || 'HS256',
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440', 10),
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || ''
};

export default settings;
