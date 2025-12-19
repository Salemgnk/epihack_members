/**
 * Points Service
 * Centralized service for managing points transactions and balances
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type PointsSource =
    | 'htb_machine'
    | 'htb_challenge'
    | 'htb_blood'
    | 'quest_completion'
    | 'duel_win'
    | 'duel_participation'
    | 'daily_login'
    | 'manual_adjustment';

export interface AddPointsParams {
    memberId: string;
    amount: number;
    source: PointsSource;
    description: string;
}

export interface PointsTransaction {
    id: string;
    member_id: string;
    points: number;
    source: string;
    description: string;
    created_at: string;
}

/**
 * Add points to a member's balance
 */
export async function addPoints(params: AddPointsParams): Promise<boolean> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Create transaction record
        const { error: txError } = await supabase
            .from('points_transactions')
            .insert({
                member_id: params.memberId,
                points: params.amount,
                source: params.source,
                description: params.description,
            });

        if (txError) {
            console.error('Error creating points transaction:', txError);
            return false;
        }

        // Update balance
        const { error: balanceError } = await supabase
            .from('member_points_balance')
            .update({
                total_points: supabase.raw(`total_points + ${params.amount}`),
            })
            .eq('member_id', params.memberId);

        if (balanceError) {
            console.error('Error updating points balance:', balanceError);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Unexpected error in addPoints:', error);
        return false;
    }
}

/**
 * Remove points from a member's balance
 */
export async function removePoints(params: AddPointsParams): Promise<boolean> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Create negative transaction
        const { error: txError } = await supabase
            .from('points_transactions')
            .insert({
                member_id: params.memberId,
                points: -params.amount,
                source: params.source,
                description: params.description,
            });

        if (txError) {
            console.error('Error creating points transaction:', txError);
            return false;
        }

        // Update balance
        const { error: balanceError } = await supabase
            .from('member_points_balance')
            .update({
                total_points: supabase.raw(`total_points - ${params.amount}`),
            })
            .eq('member_id', params.memberId);

        if (balanceError) {
            console.error('Error updating points balance:', balanceError);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Unexpected error in removePoints:', error);
        return false;
    }
}

/**
 * Get current points balance for a member
 */
export async function getBalance(memberId: string): Promise<number> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('member_points_balance')
        .select('total_points')
        .eq('member_id', memberId)
        .single();

    if (error) {
        console.error('Error fetching balance:', error);
        return 0;
    }

    return data?.total_points || 0;
}

/**
 * Get transaction history for a member
 */
export async function getTransactionHistory(
    memberId: string,
    limit: number = 10
): Promise<PointsTransaction[]> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching transaction history:', error);
        return [];
    }

    return data || [];
}

/**
 * Get points value for a specific rule type
 */
export async function getPointsRule(ruleType: string): Promise<number> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('points_rules')
        .select('points_value')
        .eq('rule_type', ruleType)
        .eq('active', true)
        .single();

    if (error) {
        console.error('Error fetching points rule:', error);
        return 0;
    }

    return data?.points_value || 0;
}

/**
 * Award points based on a points rule
 */
export async function awardPointsByRule(
    memberId: string,
    ruleType: string,
    description: string
): Promise<boolean> {
    const pointsValue = await getPointsRule(ruleType);

    if (pointsValue <= 0) {
        console.warn(`No points value found for rule type: ${ruleType}`);
        return false;
    }

    return await addPoints({
        memberId,
        amount: pointsValue,
        source: ruleType as PointsSource,
        description,
    });
}
