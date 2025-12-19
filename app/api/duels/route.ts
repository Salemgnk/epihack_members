import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
    try {
        const { challengedId, htbMachineId, htbMachineName, difficulty, durationHours, stake } = await request.json();

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

        // Validation
        if (!challengedId || !htbMachineId || !htbMachineName) {
            return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
        }

        if (challengedId === user.id) {
            return NextResponse.json({ error: 'Vous ne pouvez pas vous défier vous-même' }, { status: 400 });
        }

        // Check if challenger has enough points
        if (stake > 0) {
            const { data: balance } = await supabase
                .from('member_points_balance')
                .select('total_points')
                .eq('member_id', user.id)
                .single();

            if (!balance || balance.total_points < stake) {
                return NextResponse.json({ error: 'Solde insuffisant' }, { status: 400 });
            }

            if (stake > 100) {
                return NextResponse.json({ error: 'Mise maximale : 100 points' }, { status: 400 });
            }
        }

        // Check if both users have HTB linked
        const { data: challengerHTB } = await supabase
            .from('htb_profiles')
            .select('htb_user_id')
            .eq('member_id', user.id)
            .single();

        const { data: challengedHTB } = await supabase
            .from('htb_profiles')
            .select('htb_user_id')
            .eq('member_id', challengedId)
            .single();

        if (!challengerHTB) {
            return NextResponse.json({ error: 'Vous devez lier votre compte HTB' }, { status: 400 });
        }

        if (!challengedHTB) {
            return NextResponse.json({ error: 'L\'adversaire doit lier son compte HTB' }, { status: 400 });
        }

        // Create duel
        const { data: duel, error: duelError } = await supabase
            .from('duels')
            .insert({
                challenger_id: user.id,
                challenged_id: challengedId,
                htb_machine_id: htbMachineId,
                htb_machine_name: htbMachineName,
                htb_machine_difficulty: difficulty,
                duration_hours: durationHours || 48,
                challenger_stake: stake || 0,
                challenged_stake: 0, // Will be set when accepted
                status: 'pending',
            })
            .select()
            .single();

        if (duelError) {
            console.error('Duel creation error:', duelError);
            return NextResponse.json({ error: 'Erreur lors de la création du duel' }, { status: 500 });
        }

        // Send notification to challenged user
        const { createNotification } = await import('@/lib/services/notification-service');
        await createNotification({
            memberId: challengedId,
            type: 'DUEL_CHALLENGE',
            title: 'Nouveau défi !',
            message: `Vous avez été défié sur ${htbMachineName}`,
            data: { duelId: duel.id, machineId: htbMachineId },
        });

        return NextResponse.json({ success: true, duel });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

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
        const status = searchParams.get('status') || 'active';

        // Get duels where user is involved
        const { data: duels, error } = await supabase
            .from('duels')
            .select(`
        *,
        challenger:profiles!duels_challenger_id_fkey(id, display_name, avatar_url),
        challenged:profiles!duels_challenged_id_fkey(id, display_name, avatar_url)
      `)
            .or(`challenger_id.eq.${user.id},challenged_id.eq.${user.id}`)
            .eq('status', status)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Fetch duels error:', error);
            return NextResponse.json({ error: 'Erreur lors de la récupération des duels' }, { status: 500 });
        }

        return NextResponse.json({ duels });

    } catch (error) {
        console.error('Unexpected error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
