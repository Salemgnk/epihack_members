import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * GET /api/quests/categories
 * Fetch all quest categories
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

        const { data: categories, error } = await supabase
            .from('quest_categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching categories:', error);
            return NextResponse.json({ error: 'Erreur lors de la récupération des catégories' }, { status: 500 });
        }

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * POST /api/quests/categories
 * Create a new category (admin only)
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

        // Check if admin
        const isAdmin = user.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
        if (!isAdmin) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { name, description, color, icon } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Nom requis' }, { status: 400 });
        }

        const { data: category, error } = await supabase
            .from('quest_categories')
            .insert({
                name,
                description: description || null,
                color: color || '#3b82f6',
                icon: icon || '🎯',
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating category:', error);
            return NextResponse.json({ error: 'Erreur lors de la création de la catégorie' }, { status: 500 });
        }

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
