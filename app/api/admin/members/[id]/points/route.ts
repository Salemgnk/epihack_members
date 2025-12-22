import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { amount, description } = await request.json();

        // Verify admin (in production, use proper auth)
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email !== process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Add points using points service
        const { addPoints } = await import('@/lib/services/points-service');

        const success = await addPoints({
            memberId: id,
            amount: amount,
            source: 'manual_adjustment',
            description: description || 'Admin adjustment'
        });

        if (!success) {
            return NextResponse.json({ error: 'Failed to adjust points' }, { status: 500 });
        }

        return NextResponse.json({ success: true, amount });
    } catch (error: any) {
        console.error('Error adjusting points:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
