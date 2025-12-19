import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { assignQuest } from '@/lib/services/quest-service';

/**
 * POST /api/quests/[id]/assign
 * Assign a quest to members (admin only)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set(name, value, options);
                    },
                    remove(name: string, options: any) {
                        cookieStore.delete(name);
                    },
                },
            }
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // Check if admin
        const isAdmin = user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
        if (!isAdmin) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { memberIds, assignToAll } = await request.json();
        const { id: questId } = await params;

        let targetMemberIds: string[] = [];

        if (assignToAll) {
            // Get all members (users in auth.users)
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id');

            if (error) {
                console.error('Error fetching profiles:', error);
                return NextResponse.json({ error: 'Erreur lors de la récupération des membres' }, { status: 500 });
            }

            targetMemberIds = profiles?.map(p => p.id) || [];
        } else if (memberIds && Array.isArray(memberIds)) {
            targetMemberIds = memberIds;
        } else {
            return NextResponse.json({ error: 'memberIds ou assignToAll requis' }, { status: 400 });
        }

        const success = await assignQuest(questId, targetMemberIds);

        if (!success) {
            return NextResponse.json({ error: 'Erreur lors de l\'assignation' }, { status: 500 });
        }

        return NextResponse.json({ success: true, assignedCount: targetMemberIds.length });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
