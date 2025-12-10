'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Shield, Zap, Users, Terminal } from 'lucide-react';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                window.location.href = '/members';
            }
        };
        checkSession();
    }, []);

    const handleLogin = async () => {
        setLoading(true);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'discord',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });

        if (error) {
            console.error('Login error:', error);
            alert('Erreur de connexion. Veuillez réessayer.');
            setLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30 mb-4 backdrop-blur-sm">
                        <Shield className="w-10 h-10 text-green-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                        EPIHACK
                    </h1>
                    <p className="text-gray-400 text-sm tracking-wider uppercase">Members Access Portal</p>
                </div>

                <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-800 rounded-lg p-8 shadow-2xl">
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                                <Terminal className="w-6 h-6 text-green-400" />
                            </div>
                            <p className="text-xs text-gray-400">CTF Arena</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center">
                                <Zap className="w-6 h-6 text-blue-400" />
                            </div>
                            <p className="text-xs text-gray-400">Live Duels</p>
                        </div>
                        <div className="text-center">
                            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <p className="text-xs text-gray-400">Leaderboard</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full group relative overflow-hidden rounded-lg bg-gradient-to-r from-green-600 to-blue-600 p-[2px] transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        <div className="relative bg-gray-900 rounded-lg px-6 py-4 transition-all group-hover:bg-transparent">
                            <div className="flex items-center justify-center gap-3">
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="font-semibold">Connexion en cours...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="24" height="24" viewBox="0 0 71 55" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="currentColor" />
                                        </svg>
                                        <span className="font-semibold">Se connecter avec Discord</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </button>

                    <p className="text-center text-xs text-gray-500 mt-6">
                        Réservé aux membres EPIHACK
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                        <Shield className="w-4 h-4" />
                        <span>Connexion sécurisée via Discord OAuth</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
