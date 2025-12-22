/**
 * Rank Service
 * Handles automatic rank updates based on points
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface Rank {
    id: string;
    name: string;
    display_name: string;
    points_required: number;
    color: string;
    icon?: string;
    order_index: number;
}

/**
 * Get highest rank a member qualifies for based on their points
 */
export async function getEligibleRank(points: number): Promise<Rank | null> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data } = await supabase
        .from('ranks')
        .select('*')
        .lte('points_required', points)
        .order('points_required', { ascending: false })
        .limit(1)
        .single();

    return data;
}

/**
 * Update member's rank based on their current points
 */
export async function updateMemberRank(memberId: string): Promise<boolean> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Get member's current points
        const { data: balance } = await supabase
            .from('member_points_balance')
            .select('total_points')
            .eq('member_id', memberId)
            .single();

        if (!balance) return false;

        // Get eligible rank
        const eligibleRank = await getEligibleRank(balance.total_points);
        if (!eligibleRank) return false;

        // Get current rank
        const { data: profile } = await supabase
            .from('profiles')
            .select('current_rank_id')
            .eq('id', memberId)
            .single();

        // Update if different
        if (profile?.current_rank_id !== eligibleRank.id) {
            const { error } = await supabase
                .from('profiles')
                .update({ current_rank_id: eligibleRank.id })
                .eq('id', memberId);

            if (error) {
                console.error('Error updating rank:', error);
                return false;
            }

            console.log(`✅ Rank updated to ${eligibleRank.display_name} for ${memberId}`);
        }

        return true;
    } catch (error) {
        console.error('Error in updateMemberRank:', error);
        return false;
    }
}

/**
 * Get all ranks
 */
export async function getAllRanks(): Promise<Rank[]> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data } = await supabase
        .from('ranks')
        .select('*')
        .order('order_index', { ascending: true });

    return data || [];
}

/**
 * Get next rank for a member
 */
export async function getNextRank(points: number): Promise<Rank | null> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data } = await supabase
        .from('ranks')
        .select('*')
        .gt('points_required', points)
        .order('points_required', { ascending: true })
        .limit(1)
        .single();

    return data;
}
