import { NextResponse } from 'next/server';
import { resetExpiredQuests } from '@/lib/services/recurrence-service';

/**
 * Cron job to reset expired recurring quests
 * Called by Vercel Cron daily at midnight UTC
 */
export async function GET(request: Request) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            console.error('Unauthorized cron attempt');
            return new Response('Unauthorized', { status: 401 });
        }

        console.log('[CRON] Starting quest reset job...');

        const resetCount = await resetExpiredQuests();

        console.log(`[CRON] Reset ${resetCount} quest periods`);

        return NextResponse.json({
            success: true,
            resetCount,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error('[CRON] Error resetting quests:', error);
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
