// Public client configuration — production Supabase only.
//
// The publishable (anon) key is safe to ship in the client bundle — it is the
// key every visitor's browser uses, and all data access is enforced by Row
// Level Security in Postgres. The service-role key must NEVER appear here.

export const SUPABASE_URL = 'https://lygsfaxruxtgzcqyssbn.supabase.co';

export const SUPABASE_KEY = 'sb_publishable_cNlm-qLe1CwOJJoe_vOGDw_ZVEEcXQh';

export const DEMO_MODE = false;
