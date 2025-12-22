import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getQuestsForMember, createQuest } from '@/lib/services/quest-service';

/**
 * GET /api/quests
 * Fetch quests based on filters
 */
export async function GET(request: NextRequest) {
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

        const { searchParams } = new URL(request.url);
        const assignedToMe = searchParams.get('assigned_to_me') === 'true';
        const status = searchParams.get('status');
        const category = searchParams.get('category');

        if (assignedToMe) {
            // Get quests assigned to current user
            const quests = await getQuestsForMember(user.id, status || undefined);
            return NextResponse.json({ quests });
        }

        // Get all active quests (for admins or available quests)
        let query = supabase
            .from('quests')
            .select(`
                *,
                category:quest_categories(*)
            `)
            .eq('active', true);

        if (category) {
            query = query.eq('category_id', category);
        }

        const { data: quests, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching quests:', error);
            return NextResponse.json({ error: 'Erreur lors de la récupération des quêtes' }, { status: 500 });
        }

        return NextResponse.json({ quests });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * POST /api/quests
 * Create a new quest (admin only)
 */
export async function POST(request: NextRequest) {
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

        // Check if user is admin
        const isAdmin = user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
        if (!isAdmin) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const body = await request.json();
        const {
            title,
            description,
            points_reward,
            difficulty,
            category_id,
            quest_type,
            validation_flag,
            deadline,
            penalty_percentage,
        } = body;

        // Validation
        if (!title || !description || !points_reward || !difficulty || !quest_type) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
        }

        try {
            const quest = await createQuest({
                title,
                description,
                points_reward,
                difficulty,
                category_id: category_id || null,
                quest_type,
                validation_flag: validation_flag || null,
                deadline: deadline || null,
                penalty_percentage: penalty_percentage || 20,
                created_by: user.id,
                active: true,
            });

            return NextResponse.json({ success: true, quest });
        } catch (createError: any) {
            console.error('Create quest error:', createError);
            return NextResponse.json({
                error: 'Erreur lors de la création de la quête',
                details: createError.message
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
