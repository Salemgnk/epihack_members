import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase-client';

// Force dynamic route (don't pre-render at build time)
export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // Try with service role first (for real emails)
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (serviceKey) {
            // SERVICE ROLE PATH - with real emails
            const supabaseAdmin = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                serviceKey,
                { auth: { persistSession: false } }
            );

            // Get ALL profiles (not just those with points)
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select(`id, htb_username, current_rank_id, ranks(name, display_name, color)`)
                .order('created_at', { ascending: false });

            // Get points for each member (if they have any)
            const { data: balances } = await supabaseAdmin
                .from('member_points_balance')
                .select('member_id, total_points');

            // Get real emails from auth.users
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();

            const members = profiles?.map((profile: any) => {
                const rank = (profile?.ranks as any)?.[0];
                const authUser = users?.find((u: any) => u.id === profile.id);
                const balance = balances?.find((b: any) => b.member_id === profile.id);

                return {
                    id: profile.id,
                    email: authUser?.email || 'Unknown',
                    total_points: balance?.total_points || 0,
                    rank_name: rank?.display_name || 'Bronze',
                    rank_color: rank?.color || '#CD7F32',
                    htb_username: profile?.htb_username || null
                };
            }) || [];

            // Sort by points descending
            members.sort((a, b) => b.total_points - a.total_points);

            return NextResponse.json({ members });
        } else {
            // FALLBACK PATH - without real emails
            console.warn('SUPABASE_SERVICE_ROLE_KEY not configured - using fallback (no real emails)');

            // Get ALL profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select(`id, htb_username, current_rank_id, ranks(name, display_name, color)`)
                .order('created_at', { ascending: false });

            // Get points
            const { data: balances } = await supabase
                .from('member_points_balance')
                .select('member_id, total_points');

            const members = profiles?.map((profile: any, index: number) => {
                const rank = (profile?.ranks as any)?.[0];
                const balance = balances?.find((b: any) => b.member_id === profile.id);

                return {
                    id: profile.id,
                    email: `Member #${index + 1} (ID: ${profile.id.slice(0, 8)})`,
                    total_points: balance?.total_points || 0,
                    rank_name: rank?.display_name || 'Bronze',
                    rank_color: rank?.color || '#CD7F32',
                    htb_username: profile?.htb_username || null
                };
            }) || [];

            // Sort by points descending
            members.sort((a, b) => b.total_points - a.total_points);

            return NextResponse.json({ members });
        }
    } catch (error: any) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
