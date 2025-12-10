import { createBrowserClient } from '@supabase/ssr';

/**
 * Create Supabase client for browser usage (client components)
 */
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

// Default export for convenience
export const supabase = createClient();