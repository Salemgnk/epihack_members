'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Users, Plus, X, TrendingUp, Search } from 'lucide-react';
import { SystemCard } from '@/components/ui/SystemCard';

interface MemberStats {
    id: string;
    full_name: string;
    avatar_url: string;
    total_points: number;
    htb_machines: number;
    htb_challenges: number;
    htb_bloods: number;
    badges_count: number;
    duels_won: number;
    duels_total: number;
}

export default function ComparePage() {
    const [selectedMembers, setSelectedMembers] = useState<MemberStats[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url')
            .ilike('full_name', `%${query}%`)
            .limit(5);

        setSearchResults(data || []);
    };

    const handleAddMember = async (member: any) => {
        if (selectedMembers.length >= 4) {
            return;
        }

        if (selectedMembers.find(m => m.id === member.id)) {
            return;
        }

        setLoading(true);

        try {
            // Get member stats
            const { data: balance } = await supabase
                .from('member_points_balance')
                .select('total_points')
                .eq('member_id', member.id)
                .single();

            const { data: htbStats } = await supabase
                .from('htb_stats_cache')
                .select('machines_owned, challenges_owned, user_bloods, system_bloods')
                .eq('htb_profile_id', member.id)
                .single();

            const { count: badgesCount } = await supabase
                .from('member_badges')
                .select('*', { count: 'exact', head: true })
                .eq('member_id', member.id);

            const { count: duelsWon } = await supabase
                .from('duels')
                .select('*', { count: 'exact', head: true })
                .eq('winner_id', member.id)
                .eq('status', 'completed');

            const { count: duelsTotal } = await supabase
                .from('duels')
                .select('*', { count: 'exact', head: true })
                .or(`challenger_id.eq.${member.id},challenged_id.eq.${member.id}`)
                .eq('status', 'completed');

            setSelectedMembers([...selectedMembers, {
                ...member,
                total_points: balance?.total_points || 0,
                htb_machines: htbStats?.machines_owned || 0,
                htb_challenges: htbStats?.challenges_owned || 0,
                htb_bloods: (htbStats?.user_bloods || 0) + (htbStats?.system_bloods || 0),
                badges_count: badgesCount || 0,
                duels_won: duelsWon || 0,
                duels_total: duelsTotal || 0,
            }]);

            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            console.error('Error loading member stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveMember = (memberId: string) => {
        setSelectedMembers(selectedMembers.filter(m => m.id !== memberId));
    };

    const getMaxValue = (key: keyof MemberStats) => {
        if (selectedMembers.length === 0) return 1;
        return Math.max(...selectedMembers.map(m => Number(m[key]) || 0), 1);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-4xl font-black font-rajdhani text-white tracking-wider mb-2 animate-glitch">
                        DATA ANALYSIS
                    </h1>
                    <p className="font-tech text-system-green text-sm tracking-widest uppercase">
                        Operator Capabilities Comparison
                    </p>
                </div>
            </div>

            {/* Search */}
            <div className="mb-8 max-w-2xl mx-auto">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="SEARCH OPERATOR DATABASE..."
                        disabled={selectedMembers.length >= 4}
                        className="block w-full pl-10 pr-3 py-4 bg-black/50 border border-white/10 rounded-sm leading-5 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-black/80 focus:border-system-blue focus:ring-1 focus:ring-system-blue sm:text-sm font-tech tracking-wider uppercase transition-all"
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-system-blue/30 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.8)] z-50 backdrop-blur-xl">
                            {searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleAddMember(result)}
                                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-system-blue/10 flex items-center justify-center overflow-hidden border border-system-blue/30 group-hover:border-system-blue transition-colors">
                                        {result.avatar_url ? (
                                            <img src={result.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-system-blue font-bold font-rajdhani">{result.full_name?.[0]}</span>
                                        )}
                                    </div>
                                    <span className="font-rajdhani font-bold text-white group-hover:text-system-blue">{result.full_name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="text-center mt-2 font-tech text-xs text-muted-foreground">
                    SLOTS AVAILABLE: {4 - selectedMembers.length} / 4
                </div>
            </div>

            {/* Selected Members */}
            {selectedMembers.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {selectedMembers.map((member) => (
                        <div key={member.id} className="relative group animate-fade-in-up">
                            <button
                                onClick={() => handleRemoveMember(member.id)}
                                className="absolute -top-2 -right-2 p-1 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-full transition-colors z-10"
                            >
                                <X className="w-3 h-3" />
                            </button>
                            <SystemCard className="h-full flex flex-col items-center !p-4 hover:border-system-blue/50">
                                <div className="w-16 h-16 rounded-full border-2 border-system-blue overflow-hidden mb-3 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                                    {member.avatar_url ? (
                                        <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-system-blue/20 flex items-center justify-center text-system-blue font-bold text-xl">
                                            {member.full_name?.[0]}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold font-rajdhani text-white text-center truncate w-full">{member.full_name}</h3>
                            </SystemCard>
                        </div>
                    ))}
                </div>
            )}

            {/* Comparison Table */}
            {selectedMembers.length >= 2 && (
                <SystemCard className="!p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 border-b border-white/10">
                                    <th className="px-6 py-4 font-tech text-xs uppercase text-muted-foreground tracking-wider w-1/4">METRIC</th>
                                    {selectedMembers.map((member) => (
                                        <th key={member.id} className="px-6 py-4 font-rajdhani font-bold text-white text-center w-[18%]">
                                            {member.full_name}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-tech text-sm">
                                {/* POINTS */}
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-bold text-system-blue">TOTAL POINTS</td>
                                    {selectedMembers.map((member) => (
                                        <td key={member.id} className="px-6 py-4 text-center">
                                            <div className="font-bold text-lg text-white mb-2">{member.total_points}</div>
                                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-system-blue shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                                                    style={{ width: `${(member.total_points / getMaxValue('total_points')) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* MACHINES */}
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white">HTB MACHINES</td>
                                    {selectedMembers.map((member) => (
                                        <td key={member.id} className="px-6 py-4 text-center">
                                            <div className="font-bold text-white mb-2">{member.htb_machines}</div>
                                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-system-green"
                                                    style={{ width: `${(member.htb_machines / getMaxValue('htb_machines')) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* CHALLENGES */}
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white">HTB CHALLENGES</td>
                                    {selectedMembers.map((member) => (
                                        <td key={member.id} className="px-6 py-4 text-center">
                                            <div className="font-bold text-white mb-2">{member.htb_challenges}</div>
                                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-system-green"
                                                    style={{ width: `${(member.htb_challenges / getMaxValue('htb_challenges')) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* BLOODS */}
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-system-red">BLOODS</td>
                                    {selectedMembers.map((member) => (
                                        <td key={member.id} className="px-6 py-4 text-center">
                                            <div className="font-bold text-system-red mb-2">{member.htb_bloods}</div>
                                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-system-red shadow-[0_0_10px_rgba(255,42,42,0.5)]"
                                                    style={{ width: `${(member.htb_bloods / getMaxValue('htb_bloods')) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* BADGES */}
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-yellow-500">BADGES</td>
                                    {selectedMembers.map((member) => (
                                        <td key={member.id} className="px-6 py-4 text-center">
                                            <div className="font-bold text-yellow-500 mb-2">{member.badges_count}</div>
                                            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-yellow-500"
                                                    style={{ width: `${(member.badges_count / getMaxValue('badges_count')) * 100}%` }}
                                                />
                                            </div>
                                        </td>
                                    ))}
                                </tr>

                                {/* WIN RATE */}
                                <tr className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white">COMBAT WIN RATE</td>
                                    {selectedMembers.map((member) => {
                                        const winRate = member.duels_total > 0
                                            ? Math.round((member.duels_won / member.duels_total) * 100)
                                            : 0;
                                        return (
                                            <td key={member.id} className="px-6 py-4 text-center">
                                                <div className="font-bold text-white mb-2">{winRate}%</div>
                                                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-purple-500"
                                                        style={{ width: `${winRate}%` }}
                                                    />
                                                </div>
                                            </td>
                                        )
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </SystemCard>
            )}

            {selectedMembers.length < 2 && (
                <div className="text-center py-20 border border-white/10 rounded-lg bg-black/40">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-white/20 animate-pulse" />
                    <p className="font-rajdhani font-bold text-xl text-white mb-2">INSUFFICIENT DATA</p>
                    <p className="font-tech text-white/50 uppercase text-xs">
                        Select at least 2 Operators to begin analysis
                    </p>
                </div>
            )}
        </div>
    );
}
