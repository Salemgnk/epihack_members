import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { validateQuestSubmission } from '@/lib/services/quest-service';

/**
 * POST /api/quests/[id]/validate
 * Validate or reject a quest submission (admin only)
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

        const { memberQuestId, action, feedback } = await request.json();

        if (!memberQuestId || !action) {
            return NextResponse.json({ error: 'memberQuestId et action requis' }, { status: 400 });
        }

        if (action !== 'approve' && action !== 'reject') {
            return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
        }

        const approved = action === 'approve';
        const success = await validateQuestSubmission(memberQuestId, approved, user.id, feedback);

        if (!success) {
            return NextResponse.json({ error: 'Erreur lors de la validation' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
