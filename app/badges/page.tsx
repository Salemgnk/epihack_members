'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Award, Lock, Hexagon, Filter, ShieldCheck, Star } from 'lucide-react';
import { SystemCard } from '@/components/ui/SystemCard';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon_emoji: string;
    points_reward: number;
    rarity: string;
    earned_at?: string;
    earned: boolean;
}

export default function BadgesPage() {
    const [badges, setBadges] = useState<Badge[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');

    useEffect(() => {
        loadBadges();
    }, []);

    const loadBadges = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get all badges
            const { data: allBadges } = await supabase
                .from('gamification_badges')
                .select('*')
                .order('rarity', { ascending: false });

            // Get member's earned badges
            const { data: earnedBadges } = await supabase
                .from('member_badges')
                .select('badge_id, earned_at')
                .eq('member_id', user.id);

            const earnedIds = new Set(earnedBadges?.map(b => b.badge_id) || []);
            const earnedMap = new Map(earnedBadges?.map(b => [b.badge_id, b.earned_at]) || []);

            const formatted = allBadges?.map(badge => ({
                ...badge,
                earned: earnedIds.has(badge.id),
                earned_at: earnedMap.get(badge.id),
            })) || [];

            setBadges(formatted);
        } catch (error) {
            console.error('Load badges error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'border-gray-500 text-gray-500 shadow-[0_0_10px_rgba(107,114,128,0.2)]';
            case 'rare': return 'border-system-blue text-system-blue shadow-[0_0_10px_rgba(0,240,255,0.3)]';
            case 'epic': return 'border-purple-500 text-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]';
            case 'legendary': return 'border-yellow-500 text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]';
            default: return 'border-gray-500 text-gray-500';
        }
    };

    const getRarityBg = (rarity: string) => {
        switch (rarity) {
            case 'common': return 'bg-gray-500/10';
            case 'rare': return 'bg-system-blue/10';
            case 'epic': return 'bg-purple-500/10';
            case 'legendary': return 'bg-yellow-500/10';
            default: return 'bg-gray-500/10';
        }
    }

    const filteredBadges = badges.filter(badge => {
        if (filter === 'earned') return badge.earned;
        if (filter === 'locked') return !badge.earned;
        return true;
    });

    const earnedCount = badges.filter(b => b.earned).length;
    const totalCount = badges.length;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-4xl font-black font-rajdhani text-white tracking-wider mb-2 animate-glitch">
                        SKILL TREE
                    </h1>
                    <p className="font-tech text-system-blue text-sm tracking-widest uppercase">
                        Operator Achievements & Skills
                    </p>
                </div>
                <div className="text-right">
                    <div className="font-tech text-xs text-muted-foreground mb-1 uppercase">Completion Status</div>
                    <div className="text-2xl font-bold font-rajdhani text-white">
                        {Math.round((earnedCount / totalCount) * 100)}%
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-sm bg-black/40 border border-white/10 p-1">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-sm font-tech text-xs uppercase tracking-wider transition-all ${filter === 'all'
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        All Nodes
                    </button>
                    <button
                        onClick={() => setFilter('earned')}
                        className={`px-4 py-1.5 rounded-sm font-tech text-xs uppercase tracking-wider transition-all ${filter === 'earned'
                            ? 'bg-system-green/20 text-system-green border border-system-green/30'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Unlocked
                    </button>
                    <button
                        onClick={() => setFilter('locked')}
                        className={`px-4 py-1.5 rounded-sm font-tech text-xs uppercase tracking-wider transition-all ${filter === 'locked'
                            ? 'bg-system-red/20 text-system-red border border-system-red/30'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Locked
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="font-rajdhani text-white animate-pulse">Scanning Skills...</p>
                    </div>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredBadges.map((badge, i) => (
                        <div
                            key={badge.id}
                            className={`group relative overflow-hidden transition-all duration-300 ${badge.earned ? 'hover:-translate-y-1' : 'opacity-60 grayscale'}`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                            {/* Frame */}
                            <div className={`absolute inset-0 border clip-path-polygon ${badge.earned ? getRarityColor(badge.rarity) : 'border-white/10 bg-black/40'}`} style={{ clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px)' }}></div>

                            {/* Content */}
                            <div className={`relative p-6 h-full flex flex-col items-center text-center z-10 ${badge.earned ? getRarityBg(badge.rarity) : ''}`}>
                                {/* Status Icon */}
                                <div className="absolute top-3 right-3 text-xs font-tech">
                                    {badge.earned ? (
                                        <div className="flex items-center gap-1 text-system-green">
                                            <ShieldCheck className="w-3 h-3" /> ACQUIRED
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1 text-red-500">
                                            <Lock className="w-3 h-3" /> LOCKED
                                        </div>
                                    )}
                                </div>

                                {/* Icon Display */}
                                <div className={`w-16 h-16 mb-4 flex items-center justify-center text-4xl rounded-full border-2 transition-all duration-500 ${badge.earned ? `${getRarityColor(badge.rarity)} animate-glow-pulse` : 'border-white/10 bg-white/5 text-gray-500'}`}>
                                    {badge.icon_emoji}
                                </div>

                                <h3 className={`font-rajdhani font-bold text-lg uppercase mb-2 ${badge.earned ? 'text-white' : 'text-muted-foreground'}`}>
                                    {badge.name}
                                </h3>

                                <p className="font-tech text-xs text-muted-foreground mb-4 line-clamp-3">
                                    {badge.description}
                                </p>

                                <div className="mt-auto w-full pt-4 border-t border-white/5 flex justify-between items-center text-xs font-bold font-rajdhani">
                                    <span className={`${badge.earned ? 'text-white' : 'text-gray-600'}`}>
                                        {badge.rarity.toUpperCase()}
                                    </span>
                                    {badge.points_reward > 0 && (
                                        <span className={`${badge.earned ? 'text-system-green' : 'text-gray-600'}`}>
                                            +{badge.points_reward} PTS
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
