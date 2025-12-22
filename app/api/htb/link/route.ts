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
        const { username } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username requis' }, { status: 400 });
        }

        // Check if HTB token is configured
        if (!process.env.HTB_APP_TOKEN) {
            return NextResponse.json({ error: 'HTB_APP_TOKEN not configured on server' }, { status: 500 });
        }

        // Verify HTB account exists - create instance with token from env
        const htbClient = new HTBClient(process.env.HTB_APP_TOKEN);
        const profile = await htbClient.searchUserByUsername(username);

        if (!profile) {
            return NextResponse.json({ error: 'Compte HTB introuvable' }, { status: 404 });
        }

        // Update user profile with HTB data
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                htb_username: username,
                htb_user_id: profile.id,
                last_synced_at: new Date().toISOString(),
            })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return NextResponse.json({ error: 'Erreur lors de la liaison' }, { status: 500 });
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
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}
