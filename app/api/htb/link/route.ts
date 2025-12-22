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
        const userInput = identifier || username; // Support both new and old format

        if (!userInput) {
            return NextResponse.json({ error: 'User ID or username required' }, { status: 400 });
        }

        // Check if HTB token is configured
        if (!process.env.HTB_APP_TOKEN) {
            return NextResponse.json({ error: 'HTB_APP_TOKEN not configured on server' }, { status: 500 });
        }

        // Create HTB client instance
        const htbClient = new HTBClient(process.env.HTB_APP_TOKEN);
        let profile = null;

        // Try as User ID first (if it's a number)
        const userId = parseInt(userInput);
        if (!isNaN(userId) && userId > 0) {
            try {
                profile = await htbClient.getUserProfile(userId);
            } catch (error) {
                console.log('Not a valid user ID, trying as username:', error);
            }
        }

        // If not found by ID, try as username
        if (!profile) {
            profile = await htbClient.searchUserByUsername(userInput);
        }

        if (!profile) {
            return NextResponse.json({
                error: 'HTB account not found. Try using your User ID from app.hackthebox.com/profile'
            }, { status: 404 });
        }

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
            return NextResponse.json({ error: 'Error linking account' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            profile: {
                username: profile.name,
                id: profile.id,
            }
        });
    } catch (error: any) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
}
