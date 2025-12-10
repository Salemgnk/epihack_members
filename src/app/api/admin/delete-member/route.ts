import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { createAdminClient } from '@/lib/supabase-admin';
import { isAdmin } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
    try {
        // Check if user is admin
        const admin = await isAdmin();
        if (!admin) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized - Admin only' },
                { status: 403 }
            );
        }

        // Get member ID from request body
        const { memberId } = await request.json();
        if (!memberId) {
            return NextResponse.json(
                { success: false, message: 'Member ID is required' },
                { status: 400 }
            );
        }

        // Use admin client to delete member
        const adminClient = createAdminClient();

        // Delete from profiles table (cascade will handle related data)
        const { error } = await adminClient
            .from('profiles')
            .delete()
            .eq('id', memberId);

        if (error) {
            console.error('Error deleting member:', error);
            return NextResponse.json(
                { success: false, message: 'Failed to delete member' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Member deleted successfully',
        });
    } catch (error) {
        console.error('Delete member error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
