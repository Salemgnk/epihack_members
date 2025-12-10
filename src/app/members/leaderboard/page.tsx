'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Trophy, Medal, Award, TrendingUp, Crown, Cpu, Target } from 'lucide-react';
import { SystemCard } from '@/components/ui/SystemCard';

interface LeaderboardEntry {
    member_id: string;
    full_name: string;
    avatar_url: string;
    total_points: number;
    htb_machines?: number;
    htb_challenges?: number;
    htb_bloods?: number;
    rank?: number;
}

export default function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState<'total' | 'htb_machines' | 'htb_challenges'>('total');
    const [period, setPeriod] = useState<'all' | 'month' | 'week'>('all');

    useEffect(() => {
        loadLeaderboard();
    }, [category, period]);

    const loadLeaderboard = async () => {
        setLoading(true);
        try {
            if (category === 'total') {
                // Total points leaderboard
                const { data: balances } = await supabase
                    .from('member_points_balance')
                    .select(`
            member_id,
            total_points,
            profiles:member_id (full_name, avatar_url)
          `)
                    .order('total_points', { ascending: false })
                    .limit(50);

                const formatted = balances?.map((b: any, index) => ({
                    member_id: b.member_id,
                    full_name: b.profiles?.full_name || 'Anonyme',
                    avatar_url: b.profiles?.avatar_url,
                    total_points: b.total_points,
                    rank: index + 1,
                })) || [];

                setEntries(formatted);
            } else {
                // HTB stats leaderboard
                const orderBy = category === 'htb_machines' ? 'machines_owned' : 'challenges_owned';

                const { data: htbStats } = await supabase
                    .from('htb_stats_cache')
                    .select(`
            htb_profile_id,
            machines_owned,
            challenges_owned,
            user_bloods,
            system_bloods,
            htb_profiles!inner (
              member_id,
              profiles:member_id (full_name, avatar_url)
            )
          `)
                    .order(orderBy, { ascending: false })
                    .limit(50);

                const formatted = htbStats?.map((s: any, index) => ({
                    member_id: s.htb_profiles.member_id,
                    full_name: s.htb_profiles.profiles?.full_name || 'Anonyme',
                    avatar_url: s.htb_profiles.profiles?.avatar_url,
                    total_points: 0,
                    htb_machines: s.machines_owned,
                    htb_challenges: s.challenges_owned,
                    htb_bloods: s.user_bloods + s.system_bloods,
                    rank: index + 1,
                })) || [];

                setEntries(formatted);
            }
        } catch (error) {
            console.error('Leaderboard load error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] bg-yellow-500/10";
            case 2:
                return "border-gray-400 shadow-[0_0_20px_rgba(156,163,175,0.3)] bg-gray-400/10";
            case 3:
                return "border-orange-600 shadow-[0_0_20px_rgba(234,88,12,0.3)] bg-orange-600/10";
            default:
                return "";
        }
    };

    const getBadgeIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
            case 2: return <Medal className="w-6 h-6 text-gray-400" />;
            case 3: return <Award className="w-6 h-6 text-orange-600" />;
            default: return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-10 text-center">
                <h1 className="text-5xl font-black font-rajdhani text-white mb-2 tracking-widest uppercase relative inline-block">
                    <span className="animate-glitch block">GLOBAL RANKINGS</span>
                    <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-system-green to-transparent" />
                </h1>
                <p className="font-tech text-system-blue uppercase tracking-widest text-sm mt-4">
                    Top Operators Database
                </p>
            </div>

            {/* Filters */}
            <div className="flex justify-center mb-12">
                <div className="inline-flex rounded-sm border border-system-blue/30 bg-black/40 p-1 backdrop-blur-sm">
                    <button
                        onClick={() => setCategory('total')}
                        className={`px-6 py-2 rounded-sm font-rajdhani font-bold uppercase tracking-wider transition-all ${category === 'total'
                                ? 'bg-system-blue text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <TrendingUp className="w-4 h-4 inline-block mr-2" />
                        Total Points
                    </button>
                    <button
                        onClick={() => setCategory('htb_machines')}
                        className={`px-6 py-2 rounded-sm font-rajdhani font-bold uppercase tracking-wider transition-all ${category === 'htb_machines'
                                ? 'bg-system-green text-black shadow-[0_0_15px_rgba(0,255,157,0.4)]'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Cpu className="w-4 h-4 inline-block mr-2" />
                        Machines
                    </button>
                    <button
                        onClick={() => setCategory('htb_challenges')}
                        className={`px-6 py-2 rounded-sm font-rajdhani font-bold uppercase tracking-wider transition-all ${category === 'htb_challenges'
                                ? 'bg-system-red text-black shadow-[0_0_15px_rgba(255,42,42,0.4)]'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Target className="w-4 h-4 inline-block mr-2" />
                        Challenges
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-24">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 border-4 border-system-green/30 border-t-system-green rounded-full animate-spin" />
                        <p className="font-rajdhani text-system-green animate-pulse">SYNCING DATABASE...</p>
                    </div>
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-20 border border-white/10 rounded-lg bg-black/40">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-white/20" />
                    <p className="font-tech text-white/50 uppercase">Database Empty</p>
                </div>
            ) : (
                <div className="space-y-12">
                    {/* TOP 3 PODIUM */}
                    {entries.length >= 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto mb-16">
                            {/* 2nd Place */}
                            {entries[1] && (
                                <div className="order-2 md:order-1 relative group">
                                    <div className="absolute inset-0 bg-gray-400/20 blur-xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <div className={`relative bg-black/80 backdrop-blur-sm border border-gray-400 rounded-lg p-6 flex flex-col items-center transform transition-transform hover:-translate-y-2 ${getRankStyle(2)}`}>
                                        <div className="absolute -top-4 w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center font-bold text-black border-2 border-white shadow-lg">
                                            2
                                        </div>
                                        <div className="w-20 h-20 rounded-full border-2 border-gray-400 overflow-hidden mb-3">
                                            {entries[1].avatar_url ? (
                                                <img src={entries[1].avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-800 flex items-center justify-center text-xl text-gray-400 font-bold">
                                                    {entries[1].full_name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="font-rajdhani font-bold text-xl text-white mb-1 truncate w-full text-center">{entries[1].full_name}</div>
                                        <div className="font-tech text-gray-400 text-sm">
                                            {category === 'total' && `${entries[1].total_points} PTS`}
                                            {category === 'htb_machines' && `${entries[1].htb_machines} PWNED`}
                                            {category === 'htb_challenges' && `${entries[1].htb_challenges} SOLVED`}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 1st Place */}
                            {entries[0] && (
                                <div className="order-1 md:order-2 relative group z-10 -mt-12 md:mt-0">
                                    <div className="absolute inset-x-0 -top-20 flex justify-center animate-float">
                                        <Crown className="w-12 h-12 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                                    </div>
                                    <div className="absolute inset-0 bg-yellow-500/20 blur-2xl rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />
                                    <div className={`relative bg-black/80 backdrop-blur-sm border-2 border-yellow-500 rounded-xl p-8 flex flex-col items-center transform transition-transform hover:scale-105 ${getRankStyle(1)}`}>
                                        <div className="w-28 h-28 rounded-full border-4 border-yellow-500 overflow-hidden mb-4 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
                                            {entries[0].avatar_url ? (
                                                <img src={entries[0].avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-yellow-900/30 flex items-center justify-center text-3xl text-yellow-500 font-bold">
                                                    {entries[0].full_name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="font-rajdhani font-black text-2xl text-yellow-500 mb-1 truncate w-full text-center tracking-wide">{entries[0].full_name}</div>
                                        <div className="font-tech text-white text-lg font-bold bg-yellow-500/20 px-4 py-1 rounded border border-yellow-500/30">
                                            {category === 'total' && `${entries[0].total_points} PTS`}
                                            {category === 'htb_machines' && `${entries[0].htb_machines} PWNED`}
                                            {category === 'htb_challenges' && `${entries[0].htb_challenges} SOLVED`}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3rd Place */}
                            {entries[2] && (
                                <div className="order-3 relative group">
                                    <div className="absolute inset-0 bg-orange-600/20 blur-xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <div className={`relative bg-black/80 backdrop-blur-sm border border-orange-600 rounded-lg p-6 flex flex-col items-center transform transition-transform hover:-translate-y-2 ${getRankStyle(3)}`}>
                                        <div className="absolute -top-4 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center font-bold text-white border-2 border-white shadow-lg">
                                            3
                                        </div>
                                        <div className="w-20 h-20 rounded-full border-2 border-orange-600 overflow-hidden mb-3">
                                            {entries[2].avatar_url ? (
                                                <img src={entries[2].avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-orange-900/30 flex items-center justify-center text-xl text-orange-600 font-bold">
                                                    {entries[2].full_name[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="font-rajdhani font-bold text-xl text-white mb-1 truncate w-full text-center">{entries[2].full_name}</div>
                                        <div className="font-tech text-orange-400 text-sm">
                                            {category === 'total' && `${entries[2].total_points} PTS`}
                                            {category === 'htb_machines' && `${entries[2].htb_machines} PWNED`}
                                            {category === 'htb_challenges' && `${entries[2].htb_challenges} SOLVED`}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* LIST VIEW (RANK 4+) */}
                    <SystemCard title="OPERATOR LIST" subtitle="FULL RANKINGS">
                        <div className="space-y-2">
                            {entries.slice(3).map((entry) => (
                                <div
                                    key={entry.member_id}
                                    className="group flex items-center gap-4 p-3 rounded border border-white/5 bg-white/5 hover:bg-white/10 hover:border-system-blue/30 transition-all cursor-default"
                                >
                                    <div className="font-rajdhani font-bold text-xl text-muted-foreground w-8 text-center group-hover:text-system-blue transition-colors">
                                        #{entry.rank}
                                    </div>

                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 border border-white/10 group-hover:border-system-blue/50 transition-colors">
                                        {entry.avatar_url ? (
                                            <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-white font-bold">
                                                {entry.full_name?.[0]?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 font-rajdhani font-medium text-lg text-white group-hover:text-system-blue transition-colors">
                                        {entry.full_name}
                                    </div>

                                    <div className="font-tech font-bold text-system-green">
                                        {category === 'total' && `${entry.total_points} PTS`}
                                        {category === 'htb_machines' && `${entry.htb_machines} M`}
                                        {category === 'htb_challenges' && `${entry.htb_challenges} C`}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SystemCard>
                </div>
            )}
        </div>
    );
}
