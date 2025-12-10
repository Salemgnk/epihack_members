'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { Trophy, Zap, Target, TrendingUp, ExternalLink, Activity } from 'lucide-react';
import Link from 'next/link';

interface Profile {
    id: string;
    username: string;
    avatar_url: string;
    is_member: boolean;
    is_admin: boolean;
    total_points: number;
    year: string;
    github_username: string;
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
            const { data: { user } } = await supabase.auth.getSession();
            if (!user) {
                window.location.href = '/0x2a';
                return;
            }

            // Fetch profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (profileData) {
                setProfile(profileData);
            }

            // Fetch HTB profile
            const { data: htbData } = await supabase
                .from('htb_profiles')
                .select('*')
                .eq('member_id', user.id)
                .single();

            if (htbData) {
                setHtbProfile(htbData);

                // Fetch HTB stats cache
                const { data: statsData } = await supabase
                    .from('htb_stats_cache')
                    .select('*')
                    .eq('htb_profile_id', htbData.id)
                    .single();

                if (statsData) {
                    setHtbStats(statsData);
                }
            }

            // Fetch recent points transactions
            const { data: transactions } = await supabase
                .from('points_transactions')
                .select('*')
                .eq('member_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (transactions) {
                setRecentTransactions(transactions);
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }

    const getSourceIcon = (source: string) => {
        switch (source) {
            case 'htb': return '🎯';
            case 'discord': return '💬';
            case 'github': return '💻';
            case 'ctf': return '🚩';
            case 'duel': return '⚔️';
            case 'admin': return '👑';
            default: return '✨';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;
        return date.toLocaleDateString('fr-FR');
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="system-window p-6 rounded-lg">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="w-12 h-12 border-2 border-system-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-muted-foreground font-tech">Chargement du dashboard...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-rajdhani font-bold text-system-green mb-2">
                    Welcome back, {profile?.username || 'Member'}!
                </h1>
                <p className="text-muted-foreground">
                    {profile?.year && `${profile.year} • `}
                    {profile?.is_admin && '👑 Admin • '}
                    Membre EPIHACK
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Points */}
                <div className="glass p-6 rounded-lg border border-system-green/30">
                    <div className="flex items-center gap-3 mb-3">
                        <Trophy className="w-6 h-6 text-system-green" />
                        <h3 className="text-sm font-rajdhani font-semibold text-muted-foreground uppercase">
                            Total Points
                        </h3>
                    </div>
                    <p className="text-4xl font-mono font-bold text-system-green">
                        {profile?.total_points?.toLocaleString() || 0}
                    </p>
                </div>

                {/* HTB Rank */}
                <div className="glass p-6 rounded-lg border border-system-blue/30">
                    <div className="flex items-center gap-3 mb-3">
                        <Target className="w-6 h-6 text-system-blue" />
                        <h3 className="text-sm font-rajdhani font-semibold text-muted-foreground uppercase">
                            HTB Rank
                        </h3>
                    </div>
                    {htbStats ? (
                        <p className="text-3xl font-rajdhani font-bold text-system-blue">
                            {htbStats.rank}
                        </p>
                    ) : (
                        <Link
                            href="/profile"
                            className="text-sm text-muted-foreground hover:text-system-blue transition-colors"
                        >
                            Link HTB Account →
                        </Link>
                    )}
                </div>

                {/* HTB Points */}
                <div className="glass p-6 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-3">
                        <Zap className="w-6 h-6 text-yellow-400" />
                        <h3 className="text-sm font-rajdhani font-semibold text-muted-foreground uppercase">
                            HTB Points
                        </h3>
                    </div>
                    <p className="text-3xl font-mono font-bold text-foreground">
                        {htbStats?.points?.toLocaleString() || '—'}
                    </p>
                </div>

                {/* Machines Owned */}
                <div className="glass p-6 rounded-lg border border-border">
                    <div className="flex items-center gap-3 mb-3">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                        <h3 className="text-sm font-rajdhani font-semibold text-muted-foreground uppercase">
                            Machines
                        </h3>
                    </div>
                    <p className="text-3xl font-mono font-bold text-foreground">
                        {htbStats?.machines_owned || 0}
                    </p>
                </div>
            </div>

            {/* HTB Stats Details */}
            {htbProfile && htbStats && (
                <div className="system-window p-6 rounded-lg mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-rajdhani font-bold text-foreground flex items-center gap-2">
                            <Activity className="w-6 h-6 text-system-green" />
                            HackTheBox Stats
                        </h2>
                        <a
                            href={`https://app.hackthebox.com/users/${htbProfile.htb_user_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-system-blue hover:text-system-green transition-colors flex items-center gap-1"
                        >
                            View Profile <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass p-4 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">User Bloods</p>
                            <p className="text-2xl font-mono text-red-400 font-bold">{htbStats.user_bloods || 0}</p>
                        </div>
                        <div className="glass p-4 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">System Bloods</p>
                            <p className="text-2xl font-mono text-red-600 font-bold">{htbStats.system_bloods || 0}</p>
                        </div>
                        <div className="glass p-4 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Machines</p>
                            <p className="text-2xl font-mono text-green-400 font-bold">{htbStats.machines_owned || 0}</p>
                        </div>
                        <div className="glass p-4 rounded-lg">
                            <p className="text-xs text-muted-foreground mb-1">Challenges</p>
                            <p className="text-2xl font-mono text-blue-400 font-bold">{htbStats.challenges_owned || 0}</p>
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                        Last sync: {htbProfile.last_sync ? formatDate(htbProfile.last_sync) : 'Never'}
                    </p>
                </div>
            )}

            {/* Recent Activity */}
            <div className="system-window p-6 rounded-lg">
                <h2 className="text-2xl font-rajdhani font-bold text-foreground mb-4">
                    Recent Points Activity
                </h2>

                {recentTransactions.length > 0 ? (
                    <div className="space-y-3">
                        {recentTransactions.map((transaction) => (
                            <div
                                key={transaction.id}
                                className="glass p-4 rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getSourceIcon(transaction.source)}</span>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {transaction.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatDate(transaction.created_at)}
                                        </p>
                                    </div>
                                </div>
                                <div className={`text-lg font-mono font-bold ${transaction.points > 0 ? 'text-system-green' : 'text-system-red'
                                    }`}>
                                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="glass p-8 rounded-lg text-center">
                        <p className="text-muted-foreground">Aucune activité récente</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            Commence à gagner des points en pwn des machines HTB !
                        </p>
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            {profile?.is_admin && (
                <div className="mt-8 system-window p-6 rounded-lg border-2 border-system-red/30">
                    <h2 className="text-xl font-rajdhani font-bold text-system-red mb-4 flex items-center gap-2">
                        👑 Admin Quick Actions
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            href="/administration"
                            className="glass p-4 rounded-lg text-center hover:bg-system-red/10 transition-colors"
                        >
                            <p className="text-sm font-rajdhani font-semibold">Admin Panel</p>
                        </Link>
                        <Link
                            href="/administration/members"
                            className="glass p-4 rounded-lg text-center hover:bg-system-red/10 transition-colors"
                        >
                            <p className="text-sm font-rajdhani font-semibold">Manage Members</p>
                        </Link>
                        <Link
                            href="/members"
                            className="glass p-4 rounded-lg text-center hover:bg-system-blue/10 transition-colors"
                        >
                            <p className="text-sm font-rajdhani font-semibold">View Members</p>
                        </Link>
                        <Link
                            href="/scoreboard"
                            className="glass p-4 rounded-lg text-center hover:bg-system-green/10 transition-colors"
                        >
                            <p className="text-sm font-rajdhani font-semibold">Scoreboard</p>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
