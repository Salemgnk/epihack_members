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

            const { data: balances } = await supabaseAdmin
                .from('member_points_balance')
                .select('member_id, total_points')
                .order('total_points', { ascending: false });

            const memberIds = balances?.map((b: any) => b.member_id) || [];

            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select(`id, htb_username, current_rank_id, is_admin, ranks(name, display_name, color)`)
                .in('id', memberIds);

            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();

            const members = balances?.map((balance: any) => {
                const profile = profiles?.find((p: any) => p.id === balance.member_id);
                const rank = (profile?.ranks as any)?.[0];
                const authUser = users?.find((u: any) => u.id === balance.member_id);

                return {
                    id: balance.member_id,
                    email: authUser?.email || 'Unknown',
                    total_points: balance.total_points,
                    rank_name: rank?.display_name || 'Bronze',
                    rank_color: rank?.color || '#CD7F32',
                    htb_username: profile?.htb_username || null,
                    is_admin: profile?.is_admin || false
                };
            }) || [];

            return NextResponse.json({ members });
        } else {
            // FALLBACK PATH - without real emails
            console.warn('SUPABASE_SERVICE_ROLE_KEY not configured - using fallback (no real emails)');

            const { data: balances } = await supabase
                .from('member_points_balance')
                .select('member_id, total_points')
                .order('total_points', { ascending: false });

            const memberIds = balances?.map((b: any) => b.member_id) || [];

            const { data: profiles } = await supabase
                .from('profiles')
                .select(`id, htb_username, current_rank_id, is_admin, ranks(name, display_name, color)`)
                .in('id', memberIds);

            const members = balances?.map((balance: any, index: number) => {
                const profile = profiles?.find((p: any) => p.id === balance.member_id);
                const rank = (profile?.ranks as any)?.[0];

                return {
                    id: balance.member_id,
                    email: `Member #${index + 1} (ID: ${balance.member_id.slice(0, 8)})`,
                    total_points: balance.total_points,
                    rank_name: rank?.display_name || 'Bronze',
                    rank_color: rank?.color || '#CD7F32',
                    htb_username: profile?.htb_username || null,
                    is_admin: profile?.is_admin || false
                };
            }) || [];

            return NextResponse.json({ members });
        }
    } catch (error: any) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
