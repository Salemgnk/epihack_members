/**
 * Quest Service
 * Centralized service for managing quests, assignments, and submissions
 */

import { createClient } from '@supabase/supabase-js';
import { addPoints } from './points-service';
import { createNotification } from './notification-service';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export interface Quest {
    id: string;
    title: string;
    description: string;
    points_reward: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'insane';
    category_id: string | null;
    quest_type: 'manual' | 'auto';
    validation_flag: string | null;
    deadline: string | null;
    penalty_percentage: number;
    created_by: string;
    active: boolean;
    created_at: string;
    updated_at: string;
}

export interface MemberQuest {
    id: string;
    quest_id: string;
    member_id: string;
    status: 'assigned' | 'in_progress' | 'completed' | 'failed' | 'late';
    assigned_at: string;
    started_at: string | null;
    completed_at: string | null;
    validated_by: string | null;
    submission_data: Record<string, any>;
    points_earned: number | null;
    was_late: boolean;
    created_at: string;
}

/**
 * Create a new quest
 */
export async function createQuest(questData: Omit<Quest, 'id' | 'created_at' | 'updated_at'>): Promise<Quest | null> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('quests')
        .insert(questData)
        .select()
        .single();

    if (error) {
        console.error('Error creating quest:', error);
        return null;
    }

    return data;
}

/**
 * Assign a quest to members
 * Prevents re-assignment if already completed (non-replayable)
 */
export async function assignQuest(questId: string, memberIds: string[]): Promise<boolean> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Check which members have already completed this quest
        const { data: existingCompletions } = await supabase
            .from('member_quests')
            .select('member_id')
            .eq('quest_id', questId)
            .eq('status', 'completed');

        const completedMemberIds = new Set(existingCompletions?.map(c => c.member_id) || []);

        // Filter out members who already completed it
        const eligibleMemberIds = memberIds.filter(id => !completedMemberIds.has(id));

        if (eligibleMemberIds.length === 0) {
            console.warn('All members have already completed this quest');
            return false;
        }

        // Create assignments
        const assignments = eligibleMemberIds.map(memberId => ({
            quest_id: questId,
            member_id: memberId,
            status: 'assigned' as const,
        }));

        const { error } = await supabase
            .from('member_quests')
            .upsert(assignments, { onConflict: 'quest_id,member_id', ignoreDuplicates: true });

        if (error) {
            console.error('Error assigning quest:', error);
            return false;
        }

        // Create notifications for each member
        const { data: quest } = await supabase
            .from('quests')
            .select('title')
            .eq('id', questId)
            .single();

        for (const memberId of eligibleMemberIds) {
            await createNotification({
                memberId,
                type: 'QUEST_ASSIGNED',
                title: 'Nouvelle quête assignée',
                message: `La quête "${quest?.title || 'Unknown'}" vous a été assignée`,
                data: { questId },
            });
        }

        return true;
    } catch (error) {
        console.error('Unexpected error in assignQuest:', error);
        return false;
    }
}

/**
 * Submit a quest for validation
 */
export async function submitQuest(
    questId: string,
    memberId: string,
    submissionData: Record<string, any>
): Promise<boolean> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Get quest details and member quest
        const { data: quest } = await supabase
            .from('quests')
            .select('deadline, penalty_percentage')
            .eq('id', questId)
            .single();

        const { data: memberQuest } = await supabase
            .from('member_quests')
            .select('id, started_at')
            .eq('quest_id', questId)
            .eq('member_id', memberId)
            .single();

        if (!quest || !memberQuest) {
            console.error('Quest or member quest not found');
            return false;
        }

        // Check if late
        const now = new Date();
        const deadline = quest.deadline ? new Date(quest.deadline) : null;
        const isLate = deadline ? now > deadline : false;

        // Update member quest
        const { error } = await supabase
            .from('member_quests')
            .update({
                submission_data: submissionData,
                was_late: isLate,
                status: isLate ? 'late' : 'in_progress',
                started_at: memberQuest.started_at || now.toISOString(),
            })
            .eq('id', memberQuest.id);

        if (error) {
            console.error('Error submitting quest:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Unexpected error in submitQuest:', error);
        return false;
    }
}

/**
 * Validate a quest submission (admin)
 */
export async function validateQuestSubmission(
    memberQuestId: string,
    approved: boolean,
    validatedBy: string,
    feedback?: string
): Promise<boolean> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Get member quest and quest details
        const { data: memberQuest } = await supabase
            .from('member_quests')
            .select('quest_id, member_id, was_late')
            .eq('id', memberQuestId)
            .single();

        if (!memberQuest) {
            console.error('Member quest not found');
            return false;
        }

        if (approved) {
            // Calculate points with penalty if late
            const points = await calculateQuestPoints(memberQuest.quest_id, memberQuest.was_late);

            // Mark as completed using PostgreSQL function
            await supabase.rpc('complete_quest', {
                p_member_quest_id: memberQuestId,
                p_points_earned: points,
            });

            // Also update validated_by
            await supabase
                .from('member_quests')
                .update({ validated_by: validatedBy })
                .eq('id', memberQuestId);

            // Notify member
            const { data: quest } = await supabase
                .from('quests')
                .select('title')
                .eq('id', memberQuest.quest_id)
                .single();

            await createNotification({
                memberId: memberQuest.member_id,
                type: 'QUEST_VALIDATED',
                title: 'Quête validée !',
                message: `Votre soumission pour "${quest?.title}" a été validée. +${points} points !`,
                data: { questId: memberQuest.quest_id, points },
            });
        } else {
            // Mark as failed
            await supabase
                .from('member_quests')
                .update({
                    status: 'failed',
                    validated_by: validatedBy,
                    submission_data: {
                        ...memberQuest,
                        feedback,
                    },
                })
                .eq('id', memberQuestId);

            // Notify member
            await createNotification({
                memberId: memberQuest.member_id,
                type: 'QUEST_REJECTED',
                title: 'Quête rejetée',
                message: feedback || 'Votre soumission a été rejetée. Réessayez.',
                data: { questId: memberQuest.quest_id },
            });
        }

        return true;
    } catch (error) {
        console.error('Unexpected error in validateQuestSubmission:', error);
        return false;
    }
}

/**
 * Calculate actual points earned with penalty if late
 */
export async function calculateQuestPoints(questId: string, wasLate: boolean): Promise<number> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: quest } = await supabase
        .from('quests')
        .select('points_reward, penalty_percentage')
        .eq('id', questId)
        .single();

    if (!quest) return 0;

    let points = quest.points_reward;

    if (wasLate && quest.penalty_percentage > 0) {
        const penalty = Math.floor((points * quest.penalty_percentage) / 100);
        points = points - penalty;
    }

    return Math.max(points, 0); // Never negative
}

/**
 * Get quests for a member
 */
export async function getQuestsForMember(
    memberId: string,
    status?: string
): Promise<any[]> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
        .from('member_quests')
        .select(`
            *,
            quest:quests(*)
        `)
        .eq('member_id', memberId);

    if (status) {
        query = query.eq('status', status);
    }

    const { data, error } = await query.order('assigned_at', { ascending: false });

    if (error) {
        console.error('Error fetching member quests:', error);
        return [];
    }

    return data || [];
}

/**
 * Check if a quest can be replayed (it cannot)
 */
export async function canReplayQuest(questId: string, memberId: string): Promise<boolean> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data } = await supabase
        .from('member_quests')
        .select('status')
        .eq('quest_id', questId)
        .eq('member_id', memberId)
        .eq('status', 'completed')
        .single();

    // If already completed, cannot replay
    return !data;
}
