import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

export interface RecurrencePeriod {
    start: Date;
    end: Date;
}

export interface QuestProgress {
    id: string;
    quest_id: string;
    member_id: string;
    period_start: string;
    period_end: string;
    completed: boolean;
    completed_at: string | null;
    points_awarded: number;
}

/**
 * Get current period for a recurrence type
 */
export function getCurrentPeriod(type: RecurrenceType, resetDay?: number): RecurrencePeriod {
    const now = new Date();

    switch (type) {
        case 'daily':
            return {
                start: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0),
                end: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)
            };

        case 'weekly': {
            const currentDay = now.getDay() || 7; // 1-7 (Monday-Sunday)
            const targetDay = resetDay || 1; // Default Monday
            const daysToSubtract = (currentDay - targetDay + 7) % 7;

            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - daysToSubtract);
            weekStart.setHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);

            return { start: weekStart, end: weekEnd };
        }

        case 'monthly': {
            const targetDay = resetDay || 1;
            let monthStart: Date;

            if (now.getDate() >= targetDay) {
                // Current month period
                monthStart = new Date(now.getFullYear(), now.getMonth(), targetDay, 0, 0, 0);
            } else {
                // Previous month period
                monthStart = new Date(now.getFullYear(), now.getMonth() - 1, targetDay, 0, 0, 0);
            }

            const monthEnd = new Date(monthStart);
            monthEnd.setMonth(monthStart.getMonth() + 1);
            monthEnd.setDate(monthEnd.getDate() - 1);
            monthEnd.setHours(23, 59, 59, 999);

            return { start: monthStart, end: monthEnd };
        }

        default:
            // For 'none', return a very long period
            return {
                start: new Date(2000, 0, 1),
                end: new Date(2100, 0, 1)
            };
    }
}

/**
 * Check if a period has expired
 */
export function isPeriodExpired(periodEnd: string | Date): boolean {
    const end = typeof periodEnd === 'string' ? new Date(periodEnd) : periodEnd;
    return new Date() > end;
}

/**
 * Get or create quest progress for current period
 */
export async function getOrCreateQuestProgress(
    questId: string,
    memberId: string,
    recurrenceType: RecurrenceType,
    resetDay?: number
): Promise<QuestProgress | null> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const period = getCurrentPeriod(recurrenceType, resetDay);

    // Try to get existing progress for this period
    const { data: existing } = await supabase
        .from('quest_progress')
        .select('*')
        .eq('quest_id', questId)
        .eq('member_id', memberId)
        .gte('period_end', period.start.toISOString())
        .lte('period_start', period.end.toISOString())
        .single();

    if (existing) {
        return existing;
    }

    // Create new progress entry for this period
    const { data: newProgress, error } = await supabase
        .from('quest_progress')
        .insert({
            quest_id: questId,
            member_id: memberId,
            period_start: period.start.toISOString(),
            period_end: period.end.toISOString(),
            completed: false,
            points_awarded: 0
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating quest progress:', error);
        return null;
    }

    return newProgress;
}

/**
 * Mark quest as completed for current period
 */
export async function completeQuestProgress(
    progressId: string,
    pointsAwarded: number
): Promise<boolean> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
        .from('quest_progress')
        .update({
            completed: true,
            completed_at: new Date().toISOString(),
            points_awarded: pointsAwarded
        })
        .eq('id', progressId);

    if (error) {
        console.error('Error completing quest progress:', error);
        return false;
    }

    return true;
}

/**
 * Reset expired recurring quests (called by cron)
 * Creates new periods for all active recurring quests
 */
export async function resetExpiredQuests(): Promise<number> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active recurring quests
    const { data: quests } = await supabase
        .from('quests')
        .select('id, recurrence_type, recurrence_reset_day')
        .eq('recurrence_enabled', true)
        .neq('recurrence_type', 'none');

    if (!quests || quests.length === 0) {
        return 0;
    }

    let resetCount = 0;

    for (const quest of quests) {
        // Get all members who have this quest assigned
        const { data: assignments } = await supabase
            .from('quest_assignments')
            .select('member_id')
            .eq('quest_id', quest.id);

        if (!assignments) continue;

        for (const assignment of assignments) {
            // Check if member has progress for current period
            const progress = await getOrCreateQuestProgress(
                quest.id,
                assignment.member_id,
                quest.recurrence_type as RecurrenceType,
                quest.recurrence_reset_day
            );

            if (progress && !progress.completed) {
                resetCount++;
            }
        }
    }

    return resetCount;
}
