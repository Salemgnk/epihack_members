import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET() {
    try {
        // Get all members with points and ranks
        const { data: balances, error: balanceError } = await supabase
            .from('member_points_balance')
            .select('member_id, total_points')
            .order('total_points', { ascending: false });

        if (balanceError) throw balanceError;

        // Get profiles with ranks
        const memberIds = balances?.map((b: any) => b.member_id) || [];

        const { data: profiles } = await supabase
            .from('profiles')
            .select(`
                id,
                htb_username,
                current_rank_id,
                ranks(name, display_name, color)
            `)
            .in('id', memberIds);

        // Build members list (email will come from auth later)
        const members = balances?.map((balance: any, index: number) => {
            const profile = profiles?.find((p: any) => p.id === balance.member_id);
            const rank = (profile?.ranks as any)?.[0];

            return {
                id: balance.member_id,
                email: `user${index + 1}@example.com`, // Placeholder - needs server-side auth lookup
                total_points: balance.total_points,
                rank_name: rank?.display_name || 'Bronze',
                rank_color: rank?.color || '#CD7F32',
                htb_username: profile?.htb_username || null
            };
        }) || [];

        return NextResponse.json({ members });
    } catch (error: any) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
