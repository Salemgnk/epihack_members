import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

// Admin client with service role key for privileged operations
// WARNING: Only use on server-side (API routes, Server Components)
// Never expose service role key to the client
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase admin environment variables');
    }

    return createSupabaseAdmin(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
