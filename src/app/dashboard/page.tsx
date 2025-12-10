'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { ExternalLink, Activity, Trophy, Zap, MessageSquare, Sword, Crown, Flag, Target } from 'lucide-react';
import Link from 'next/link';
import { StatusWindow } from '@/components/system/StatusWindow';
import { SystemWindow } from '@/components/system/SystemWindow';
import { PlayerAttributes, PlayerStats } from '@/lib/system-types';

interface Profile {
    id: string;
    username: string;
    avatar_url: string;
    is_member: boolean;
    is_admin: boolean;
    total_points: number;
    year: string;
    github_username: string;
    // System Stats
    attributes: PlayerStats;
    job_class: string;
    title: string;
    level: number;
    experience: number;
    mana: number;
    max_mana: number;
}

interface HTBProfile {
    id: string;
    htb_user_id: number;
    htb_username: string;
    last_sync: string;
}

interface HTBStats {
    rank: string;
    points: number;
    user_bloods: number;
    system_bloods: number;
    machines_owned: number;
    challenges_owned: number;
}

interface PointsTransaction {
    id: string;
    points: number;
    source: string;
    description: string;
    created_at: string;
}

export default function DashboardPage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [htbProfile, setHtbProfile] = useState<HTBProfile | null>(null);
    const [htbStats, setHtbStats] = useState<HTBStats | null>(null);
    const [recentTransactions, setRecentTransactions] = useState<PointsTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    async function fetchDashboardData() {
        try {
            const supabase = createClient();

            // Get current user
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                window.location.href = '/0x2a';
                return;
            }
            const user = session.user;

            // Fetch profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                // Ensure default attributes if missing (migration safety)
                const safeProfile = {
                    ...profileData,
                    attributes: profileData.attributes || { STR: 10, AGI: 10, INT: 10, VIT: 10, SENSE: 10 },
                    level: profileData.level || 1,
                    job_class: profileData.job_class || 'Novice',
                    title: profileData.title || 'Player',
                    mana: profileData.mana || 100,
                    max_mana: profileData.max_mana || 100,
                    experience: profileData.experience || 0
                };
                setProfile(safeProfile);
            }

            // Fetch HTB profile
            const { data: htbData } = await supabase
                .from('htb_profiles')
                .select('*')
                .eq('member_id', user.id)
                .single();

            if (htbData) {
                setHtbProfile(htbData);
                const { data: statsData } = await supabase
                    .from('htb_stats_cache')
                    .select('*')
                    .eq('htb_profile_id', htbData.id)
                    .single();
                if (statsData) setHtbStats(statsData);
            }

            // Fetch transactions
            const { data: transactions } = await supabase
                .from('points_transactions')
                .select('*')
                .eq('member_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (transactions) setRecentTransactions(transactions);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'htb': return <Target className="w-5 h-5 text-system-red" />;
            case 'discord': return <MessageSquare className="w-5 h-5 text-system-blue" />;
            case 'github': return <ExternalLink className="w-5 h-5 text-white" />;
            case 'ctf': return <Flag className="w-5 h-5 text-yellow-500" />;
            case 'duel': return <Sword className="w-5 h-5 text-purple-500" />;
            case 'admin': return <Crown className="w-5 h-5 text-yellow-400" />;
            default: return <Zap className="w-5 h-5 text-system-green" />;
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="text-center">
                    <div className="w-16 h-16 border-2 border-system-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-system-blue font-tech animate-pulse">INITIALIZING SYSTEM...</p>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const playerAttributes: PlayerAttributes = {
        level: profile.level,
        experience: profile.experience,
        job_class: profile.job_class,
        title: profile.title,
        mana: profile.mana,
        max_mana: profile.max_mana,
        attributes: profile.attributes
    };

    return (
        <div className="min-h-screen bg-[url('/assets/grid-bg.png')] bg-fixed bg-cover p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* 1. STATUS WINDOW (Main Card) */}
                <StatusWindow
                    username={profile.username}
                    attributes={playerAttributes}
                    adminMode={profile.is_admin} // God Mode for Admins
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* 2. ACTIVITY LOG (Quest Log Aesthetic) */}
                    <SystemWindow
                        title="System Logs"
                        className="lg:col-span-2 p-6"
                        borderColor="var(--system-green)"
                    >
                        <div className="flex items-center justify-between mb-4 text-xs font-tech text-muted-foreground/50 border-b border-white/5 pb-2">
                            <span>TIMESTAMP</span>
                            <span>SOURCE</span>
                            <span>EVENT_ID</span>
                        </div>

                        <div className="space-y-2">
                            {recentTransactions.length > 0 ? (
                                recentTransactions.map((tx) => (
                                    <div
                                        key={tx.id}
                                        className="group flex items-center justify-between p-3 rounded bg-white/5 hover:bg-white/10 border border-transparent hover:border-system-green/30 transition-all cursor-default"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-black/40 rounded border border-white/10 group-hover:border-system-green/50">
                                                {getSourceIcon(tx.source)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-rajdhani font-semibold text-white group-hover:text-system-green transition-colors">
                                                    {tx.description}
                                                </p>
                                                <p className="text-xs font-tech text-muted-foreground">
                                                    {formatDate(tx.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`font-mono text-lg font-bold ${tx.points > 0 ? 'text-system-green' : 'text-system-red'}`}>
                                            {tx.points > 0 ? '+' : ''}{tx.points}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground font-tech">
                                    [NO LOGS RECORDED]
                                </div>
                            )}
                        </div>
                    </SystemWindow>

                    {/* 3. EXTERNAL DATA (HTB Integration) */}
                    <div className="space-y-8">
                        <SystemWindow
                            title="External Connection"
                            className="p-6"
                            borderColor="#FF2A2A" // Red for "External/Danger"
                        >
                            <div className="mb-4">
                                <h3 className="text-lg font-rajdhani font-bold text-white flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-system-red" />
                                    HackTheBox
                                </h3>
                                <p className="text-xs font-tech text-muted-foreground">
                                    STATUS: {htbProfile ? 'CONNECTED' : 'DISCONNECTED'}
                                </p>
                            </div>

                            {htbProfile && htbStats ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="p-3 bg-black/40 rounded border border-white/10">
                                            <span className="text-xs text-muted-foreground block text-center">RANK</span>
                                            <span className="text-lg font-rajdhani font-bold text-white block text-center truncate">
                                                {htbStats.rank}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-black/40 rounded border border-white/10">
                                            <span className="text-xs text-muted-foreground block text-center">OWNED</span>
                                            <span className="text-lg font-rajdhani font-bold text-system-red block text-center">
                                                {htbStats.machines_owned + htbStats.challenges_owned}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="w-full h-[1px] bg-white/10" />

                                    <div className="flex justify-between items-center text-xs font-tech">
                                        <span className="text-muted-foreground">Packet Loss: 0%</span>
                                        <a
                                            href={`https://app.hackthebox.com/users/${htbProfile.htb_user_id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-system-red hover:underline"
                                        >
                                            OPEN TERMINAL {'>'}
                                        </a>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <Link
                                        href="/profile"
                                        className="inline-block px-4 py-2 bg-system-red/20 border border-system-red/50 text-system-red rounded font-tech text-sm hover:bg-system-red/30 transition-colors"
                                    >
                                        [ ESTABLISH UPLINK ]
                                    </Link>
                                </div>
                            )}
                        </SystemWindow>

                        {/* Admin Tools */}
                        {profile.is_admin && (
                            <SystemWindow
                                title="Administrator"
                                className="p-6"
                                borderColor="#FFD700"
                            >
                                <div className="grid grid-cols-2 gap-3">
                                    <Link
                                        href="/administration"
                                        className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-center hover:bg-yellow-500/20 transition-all"
                                    >
                                        <Crown className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                                        <span className="text-xs font-rajdhani font-bold text-yellow-200">PANEL</span>
                                    </Link>
                                    <Link
                                        href="/administration/members"
                                        className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-center hover:bg-yellow-500/20 transition-all"
                                    >
                                        <span className="text-lg font-mono font-bold text-yellow-400 block mb-1">ALL</span>
                                        <span className="text-xs font-rajdhani font-bold text-yellow-200">MEMBERS</span>
                                    </Link>
                                </div>
                            </SystemWindow>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
