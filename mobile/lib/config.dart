// Public client configuration — production Supabase only.
//
// The publishable (anon) key is safe to ship in the app — every user's device
// uses it, and all data access is enforced by Row Level Security in Postgres.
// The service-role key must NEVER appear here.

const supabaseUrl = 'https://lygsfaxruxtgzcqyssbn.supabase.co';
const supabaseKey = 'sb_publishable_cNlm-qLe1CwOJJoe_vOGDw_ZVEEcXQh';

// Hardcoded for the RTCM-Tunasan deployment (matches supabase/seed.sql).
const churchId = 'a1b2c3d4-e5f6-47a8-9b0c-1d2e3f4a5b6c';
const churchName = 'RTCM-Tunasan';
