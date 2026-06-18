import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import settings from '../config/settings.js';

// Polyfill WebSocket for Node versions < 22 (required for Supabase Realtime in Hostinger Node 20)
global.WebSocket = ws;

if (!settings.SUPABASE_URL || !settings.SUPABASE_SERVICE_KEY) {
  console.warn('[SUPABASE] Warning: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing in environment variables.');
}

const supabaseUrl = settings.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = settings.SUPABASE_SERVICE_KEY || 'placeholder';

// Create Supabase client with service role key for admin privileges
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

export default supabase;
