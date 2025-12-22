'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Users, Award, Shield, Scroll } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAdmin();
    }, []);

    const checkAdmin = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            router.push('/');
            setLoading(false);
            return;
        }

        try {
            // Try to check is_admin flag in profiles
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (error) {
                // Column doesn't exist yet - fallback to email check
                console.warn('is_admin column not found, using email fallback');
                const adminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
                if (user.email === adminEmail) {
                    setIsAdmin(true);
                } else {
                    router.push('/');
                }
            } else if (profile?.is_admin) {
                setIsAdmin(true);
            } else {
                router.push('/');
            }
        } catch (error) {
            console.error('Admin check error:', error);
            router.push('/');
        }

        setLoading(false);
    };

    const tabs = [
        { label: 'Members', href: '/admin/members', icon: Users },
        { label: 'Ranks', href: '/admin/ranks', icon: Award },
        { label: 'Titles', href: '/admin/titles', icon: Shield },
        { label: 'Quests', href: '/admin/quests', icon: Scroll },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-system-green font-tech animate-pulse">VERIFYING ACCESS...</div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-bold font-rajdhani text-system-red">
                        ADMIN PANEL
                    </h1>
                    <p className="text-white/60 font-tech text-sm">
                        System administration & management
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex justify-center">
                    <div className="inline-flex gap-2 p-1 bg-white/5 border border-system-red/30 rounded-lg">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = pathname.startsWith(tab.href);

                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-md font-tech text-sm transition-all
                    ${isActive
                                            ? 'bg-system-red text-black font-bold'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                {children}
            </div>
        </div>
    );
}
