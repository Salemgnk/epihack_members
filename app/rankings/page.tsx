'use client';

import { useEffect, useState } from 'react';
import { SystemCard } from '@/components/ui/SystemCard';
import { Trophy, Medal, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface RankedMember {
    id: string;
    username: string;
    h

    tb_username: string | null;
    total_points: number;
    rank_name: string;
    rank_color: string;
    rank_display_name: string;
    position: number;
}

export default function RankingsPage() {
    const [members, setMembers] = useState<RankedMember[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRankings();
    }, []);

    const loadRankings = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);

            // Fetch leaderboard with ranks
            const { data, error } = await supabase
                .from('member_points_balance')
                .select(`
          member_id,
          total_points,
          profiles!inner(htb_username),
          ranks!profiles_current_rank_id_fkey(name, display_name, color)
        `)
                .order('total_points', { ascending: false })
                .limit(100);

            if (error) throw error;

            // Get usernames from auth.users
            const memberIds = data?.map(m => m.member_id) || [];
            const { data: authUsers } = await supabase.auth.admin.listUsers();

            // Transform data
            const ranked = data?.map((member, index) => {
                const authUser = authUsers?.users.find(u => u.id === member.member_id);
                const username = authUser?.email?.split('@')[0] || 'Unknown';

                return {
                    id: member.member_id,
                    username,
                    htb_username: member.profiles?.htb_username || null,
                    total_points: member.total_points,
                    rank_name: member.ranks?.name || 'bronze',
                    rank_color: member.ranks?.color || '#CD7F32',
                    rank_display_name: member.ranks?.display_name || 'Bronze',
                    position: index + 1
                };
            }) || [];

            setMembers(ranked);
        } catch (error) {
            console.error('Error loading rankings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (position: number) => {
        if (position === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
        if (position === 2) return <Medal className="w-6 h-6 text-gray-300" />;
        if (position === 3) return <Award className="w-6 h-6 text-amber-600" />;
        return <span className="text-muted-foreground font-tech text-sm">#{position}</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black p-6 flex items-center justify-center">
                <div className="text-system-green font-tech animate-pulse">LOADING RANKINGS...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-bold font-rajdhani text-system-green">
                        LEADERBOARD
                    </h1>
                    <p className="text-white/60 font-tech text-sm">
                        Top {members.length} hackers ranked by SYS.POINTS
                    </p>
                </div>

                {/* Rankings Table */}
                <SystemCard title="RANKINGS" subtitle="GLOBAL LEADERBOARD">
                    <div className="space-y-2">
                        {members.map((member) => {
                            const isCurrentUser = member.id === currentUserId;

                            return (
                                <div
                                    key={member.id}
                                    className={`
                    flex items-center justify-between p-4 rounded-sm border transition-all
                    ${isCurrentUser
                                            ? 'bg-system-green/10 border-system-green shadow-lg shadow-system-green/20'
                                            : 'bg-white/5 border-white/10 hover:border-white/30'
                                        }
                  `}
                                >
                                    {/* Rank Position */}
                                    <div className="w-12 flex items-center justify-center">
                                        {getRankIcon(member.position)}
                                    </div>

                                    {/* Player Info */}
                                    <div className="flex-1 flex items-center gap-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`font-rajdhani font-bold ${isCurrentUser ? 'text-system-green' : 'text-white'}`}>
                                                    {member.username}
                                                </span>
                                                {member.htb_username && (
                                                    <span className="text-xs px-2 py-0.5 bg-system-green/20 text-system-green border border-system-green/30 rounded font-tech">
                                                        HTB: {member.htb_username}
                                                    </span>
                                                )}
                                            </div>
                                            {isCurrentUser && (
                                                <span className="text-xs text-system-green font-tech">YOU</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Points */}
                                    <div className="text-right w-24">
                                        <div className="font-rajdhani font-bold text-xl text-white">
                                            {member.total_points}
                                        </div>
                                        <div className="text-xs text-muted-foreground font-tech">PTS</div>
                                    </div>

                                    {/* Rank */}
                                    <div className="w-32 text-right">
                                        <div
                                            className="font-rajdhani font-bold text-lg"
                                            style={{ color: member.rank_color }}
                                        >
                                            {member.rank_display_name}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {members.length === 0 && (
                            <div className="text-center py-12 text-muted-foreground font-tech">
                                No rankings found. Be the first to earn points!
                            </div>
                        )}
                    </div>
                </SystemCard>
            </div>
        </div>
    );
}
