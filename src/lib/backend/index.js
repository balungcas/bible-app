import { createSupabaseBackend } from './supabase.js';
import { SUPABASE_URL, SUPABASE_KEY } from '../config.js';

// Production backend — Supabase only (Postgres + RLS).
export const backend = createSupabaseBackend(SUPABASE_URL, SUPABASE_KEY);
