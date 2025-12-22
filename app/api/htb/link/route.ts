import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { HTBClient } from '@/lib/htb-client';

/**
 * POST /api/htb/link
 * Link HTB account to user profile
 */
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set(name, value, options);
                    },
                    remove(name: string, options: any) {
                        cookieStore.delete(name);
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const body = await request.json();
        const { identifier, username } = body;
        const userInput = identifier || username;

        if (!userInput) {
            return NextResponse.json({ error: 'HTB User ID or username required' }, { status: 400 });
        }

        // Check if HTB token is configured
        if (!process.env.HTB_APP_TOKEN) {
            return NextResponse.json({ error: 'HTB_APP_TOKEN not configured on server' }, { status: 500 });
        }

        // Create HTB client instance with labs.hackthebox.com base URL
        const htbClient = new HTBClient(process.env.HTB_APP_TOKEN);
        let profile = null;

        // Try as User ID first (if it's a number)
        const userId = parseInt(userInput);
        if (!isNaN(userId) && userId > 0) {
            try {
                console.log('Trying User ID:', userId);
                profile = await htbClient.getUserProfile(userId);
                console.log('Profile found by ID:', profile?.name);
            } catch (error: any) {
                console.log('User ID lookup failed, trying username search...', error.message);
            }
        }

        // If not found by ID, try as username using POST /search/users
        if (!profile) {
            try {
                console.log('Searching by username:', userInput);
                profile = await htbClient.searchUserByUsername(userInput);
                console.log('Profile found by username:', profile?.name);
            } catch (error: any) {
                console.error('Username search failed:', error.message);
            }
        }

        if (!profile) {
            return NextResponse.json({
                error: 'HTB account not found. Verify your User ID or username is correct.'
            }, { status: 404 });
        }

        try {
            // Update user profile with HTB data
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    htb_username: profile.name,
                    htb_user_id: profile.id,
                    last_synced_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating profile:', updateError);
                return NextResponse.json({ error: 'Error linking account to database' }, { status: 500 });
            }

            return NextResponse.json({
                success: true,
                profile: {
                    username: profile.name,
                    id: profile.id,
                }
            });
        } catch (error: any) {
            console.error('Database update error:', error);
            return NextResponse.json({
                error: `Failed to save HTB profile: ${error.message}`
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
