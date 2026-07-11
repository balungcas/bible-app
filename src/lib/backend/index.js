import { createLocalBackend } from './local.js';
import { createSupabaseBackend } from './supabase.js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// With Supabase credentials configured the app runs against Postgres + RLS;
// without them it falls back to a self-contained localStorage demo.
export const backend =
  url && anonKey ? createSupabaseBackend(url, anonKey) : createLocalBackend();
