import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { isMember } from '@/lib/auth';

export async function GET(request: NextRequest) {
    try {
        // Check if user is a member
        const member = await isMember();
        if (!member) {
            return NextResponse.json(
                { error: 'Unauthorized - Members only' },
                { status: 403 }
            );
        }

        const supabase = await createClient();

        // Fetch all members with their stats
        const { data: members, error } = await supabase
            .from('profiles')
            .select(`
        id,
        username,
        avatar_url,
        is_member,
        is_admin,
        year,
        skills,
        github_username,
        created_at
      `)
            .eq('is_member', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching members:', error);
            return NextResponse.json(
                { error: 'Failed to fetch members' },
                { status: 500 }
            );
        }

        // Get stats summary
        const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('is_member', true);

        return NextResponse.json({
            members: members || [],
            stats: {
                totalMembers: count || 0,
            },
        });
    } catch (error) {
        console.error('Secret members API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
