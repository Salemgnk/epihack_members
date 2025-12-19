/**
 * Notification Service
 * Centralized service for creating and managing notifications
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export type NotificationType =
    | 'DUEL_CHALLENGE'
    | 'DUEL_ACCEPTED'
    | 'DUEL_REFUSED'
    | 'DUEL_WON'
    | 'DUEL_LOST'
    | 'HTB_ACHIEVEMENT'
    | 'POINTS_EARNED'
    | 'QUEST_ASSIGNED'
    | 'QUEST_VALIDATED'
    | 'QUEST_REJECTED';

export interface CreateNotificationParams {
    memberId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: Record<string, any>;
}

export interface Notification {
    id: string;
    member_id: string;
    type: NotificationType;
    title: string;
    message: string;
    data: Record<string, any>;
    read: boolean;
    created_at: string;
}

/**
 * Create a new notification
 */
export async function createNotification(params: CreateNotificationParams): Promise<Notification | null> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
        .from('notifications')
        .insert({
            member_id: params.memberId,
            type: params.type,
            title: params.title,
            message: params.message,
            data: params.data || {},
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating notification:', error);
        return null;
    }

    return data;
}

/**
 * Get notifications for a user
 */
export async function getNotifications(
    memberId: string,
    limit: number = 10,
    unreadOnly: boolean = false
): Promise<Notification[]> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    let query = supabase
        .from('notifications')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (unreadOnly) {
        query = query.eq('read', false);
    }

    const { data, error } = await query;

    if (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }

    return data || [];
}

/**
 * Mark a notification as read
 */
export async function markAsRead(notificationId: string): Promise<boolean> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

    if (error) {
        console.error('Error marking notification as read:', error);
        return false;
    }

    return true;
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllAsRead(memberId: string): Promise<boolean> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('member_id', memberId)
        .eq('read', false);

    if (error) {
        console.error('Error marking all notifications as read:', error);
        return false;
    }

    return true;
}

/**
 * Get unread count for a user
 */
export async function getUnreadCount(memberId: string): Promise<number> {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('member_id', memberId)
        .eq('read', false);

    if (error) {
        console.error('Error getting unread count:', error);
        return 0;
    }

    return count || 0;
}
