import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
    const supabase = createClient();

    try {
        // Fetch leaderboard with ranks and profiles
        const { data: balances, error: balanceError } = await supabase
            .from('member_points_balance')
            .select('member_id, total_points')
            .order('total_points', { ascending: false })
            .limit(100);

        if (balanceError) throw balanceError;

        // Get all member profiles and ranks
        const memberIds = balances?.map(b => b.member_id) || [];

        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select(`
                id,
                htb_username,
                current_rank_id,
                ranks(name, display_name, color)
            `)
            .in('id', memberIds);

        if (profilesError) throw profilesError;

        // Build rankings
        const rankings = balances?.map((balance, index) => {
            const profile = profiles?.find(p => p.id === balance.member_id);
            const rank = profile?.ranks as any;

            return {
                id: balance.member_id,
                username: `Player${index + 1}`, // Fallback - will get from email
                htb_username: profile?.htb_username || null,
                total_points: balance.total_points,
                rank_name: rank?.name || 'bronze',
                rank_color: rank?.color || '#CD7F32',
                rank_display_name: rank?.display_name || 'Bronze',
                position: index + 1
            };
        }) || [];

        return NextResponse.json({ rankings });
    } catch (error: any) {
        console.error('Error fetching rankings:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
