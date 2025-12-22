import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase with service role for auth access
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Need service role for auth.users access
    { auth: { persistSession: false } }
);

export async function GET() {
    try {
        // Get all members with points and ranks
        const { data: balances, error: balanceError } = await supabaseAdmin
            .from('member_points_balance')
            .select('member_id, total_points')
            .order('total_points', { ascending: false });

        if (balanceError) throw balanceError;

        // Get profiles with ranks
        const memberIds = balances?.map((b: any) => b.member_id) || [];

        const { data: profiles } = await supabaseAdmin
            .from('profiles')
            .select(`
                id,
                htb_username,
                current_rank_id,
                is_admin,
                ranks(name, display_name, color)
            `)
            .in('id', memberIds);

        // Get real emails from auth.users (server-side only)
        const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

        if (usersError) throw usersError;

        // Build members list with real emails
        const members = balances?.map((balance: any) => {
            const profile = profiles?.find((p: any) => p.id === balance.member_id);
            const rank = (profile?.ranks as any)?.[0];
            const authUser = users?.find(u => u.id === balance.member_id);

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
    } catch (error: any) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
