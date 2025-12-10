import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');
    const error = requestUrl.searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
    }

    if (code) {
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

        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
            return NextResponse.redirect(new URL('/login?error=exchange_failed', request.url));
        }

        // Vérifier si le profil existe
        const userId = data.session?.user?.id;
        if (userId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', userId)
                .single();

            if (!profile) {
                await supabase
                    .from('profiles')
                    .insert({
                        id: userId,
                        username: data.session?.user?.user_metadata?.full_name ||
                            data.session?.user?.user_metadata?.name ||
                            data.session?.user?.email?.split('@')[0] ||
                            'User',
                        avatar_url: data.session?.user?.user_metadata?.avatar_url,
                        is_member: true,
                        is_admin: false,
                    });
            }
        }
    }

    return NextResponse.redirect(new URL('/', request.url));
}
