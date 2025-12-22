'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Trophy, Zap, Swords, TrendingUp, Link as LinkIcon, Activity, Target, Terminal } from 'lucide-react';
import Link from 'next/link';
import { SystemCard } from '@/components/ui/SystemCard';

interface DashboardStats {
  totalPoints: number;
  htbLinked: boolean;
  htbStats: {
    rank: string;
    points: number;
    machines_owned: number;
    challenges_owned: number;
    user_bloods: number;
    avatar_url?: string;
  } | null;
  activeDuels: number;
  recentTransactions: Array<{
    id: string;
    points: number;
    source: string;
    description: string;
    created_at: string;
  }>;
}

export default function MembersDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) return;

      setUser(currentUser);

      // Get user profile with HTB data
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('htb_username, htb_user_id, last_synced_at')
        .eq('id', currentUser.id)
        .single();

      setProfile(userProfile);

      // Get points balance
      const { data: balance } = await supabase
        .from('member_points_balance')
        .select('total_points')
        .eq('member_id', currentUser.id)
        .single();

      // Check HTB linked
      const { data: htbProfile } = await supabase
        .from('htb_profiles')
        .select('htb_user_id')
        .eq('member_id', currentUser.id)
        .single();

      // Get HTB stats if linked
      let htbStats = null;
      if (htbProfile) {
        const { data: stats } = await supabase
          .from('htb_stats_cache')
          .select('*')
          .eq('htb_profile_id', currentUser.id)
          .single();
        htbStats = stats;
      }

      // Get active duels count
      const { count: activeDuelsCount } = await supabase
        .from('duels')
        .select('*', { count: 'exact', head: true })
        .or(`challenger_id.eq.${currentUser.id},challenged_id.eq.${currentUser.id}`)
        .eq('status', 'active');

      // Get recent transactions
      const { data: transactions } = await supabase
        .from('points_transactions')
        .select('*')
        .eq('member_id', currentUser.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalPoints: balance?.total_points || 0,
        htbLinked: !!htbProfile,
        htbStats,
        activeDuels: activeDuelsCount || 0,
        recentTransactions: transactions || [],
      });
    } catch (error) {
      console.error('Dashboard load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-system-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-system-blue/30 border-t-system-blue rounded-full animate-spin" />
          <p className="font-rajdhani text-system-blue animate-pulse">SYSTEM INITIALIZATION...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
        <div>
          <h1 className="text-4xl font-black font-rajdhani text-white tracking-wider mb-1 animate-glitch">
            SYSTEM DASHBOARD
          </h1>
          <p className="font-tech text-system-blue text-sm tracking-widest uppercase">
            Welcome back, Player {user?.email?.split('@')[0]}
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <div className="font-tech text-xs text-muted-foreground">SYSTEM STATUS</div>
          <div className="text-system-green font-bold flex items-center gap-2">
            <div className="w-2 h-2 bg-system-green rounded-full animate-pulse" />
            ONLINE
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT COLUMN: PLAYER STATUS */}
        <div className="lg:col-span-4 space-y-6">
          {/* Player Card */}
          <SystemCard title="PLAYER STATUS" glowing delay={1}>
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-4">
                {/* Avatar Frame */}
                <div className="absolute inset-0 border-2 border-system-blue rounded-full opacity-50 animate-pulse-slow" />
                <div className="absolute -inset-2 border border-system-blue/30 rounded-full border-dashed animate-spin-slow" />

                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden border-4 border-black relative z-10">
                  {user?.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl font-bold font-rajdhani text-system-blue">
                      {user?.email?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 bg-black border border-system-green px-3 py-1 rounded-sm text-system-green font-bold font-rajdhani text-sm z-10">
                  LVL. {Math.floor((stats?.totalPoints || 0) / 100) + 1}
                </div>
              </div>

              <h2 className="text-2xl font-bold font-rajdhani text-white mb-1">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-xs font-tech text-muted-foreground bg-white/5 px-2 py-1 rounded">
                  CLASS: HACKER
                </div>
                {profile?.htb_username && (
                  <div className="text-xs font-tech text-system-green bg-system-green/10 border border-system-green/30 px-2 py-1 rounded flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                    </svg>
                    HTB: {profile.htb_username}
                  </div>
                )}
              </div>
            </div>


            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 p-3 rounded border border-white/5">
                <div className="text-xs text-muted-foreground font-tech">SYS.POINTS</div>
                <div className="text-2xl font-bold font-rajdhani text-system-green">
                  {stats?.totalPoints}
                </div>
              </div>
              <div className="bg-black/40 p-3 rounded border border-white/5">
                <div className="text-xs text-muted-foreground font-tech">RANK</div>
                <div className="text-2xl font-bold font-rajdhani text-system-blue truncate">
                  {stats?.htbStats?.rank || "N/A"}
                </div>
              </div>
            </div>
          </SystemCard>

          {/* Attributes Hex Grid (Visual) */}
          <SystemCard title="ATTRIBUTES" delay={2}>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-tech text-system-blue">INT (Machines)</span>
                <span className="font-rajdhani font-bold text-xl">{stats?.htbStats?.machines_owned || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-tech text-system-green">DEX (Challenges)</span>
                <span className="font-rajdhani font-bold text-xl">{stats?.htbStats?.challenges_owned || 0}</span>
              </div>
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="font-tech text-system-red">STR (Bloods)</span>
                <span className="font-rajdhani font-bold text-xl">{stats?.htbStats?.user_bloods || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-tech text-yellow-500">CHA (Duels)</span>
                <span className="font-rajdhani font-bold text-xl">{stats?.activeDuels || 0}</span>
              </div>
            </div>
          </SystemCard>
        </div>

        {/* RIGHT COLUMN: MAIN CONTENT */}
        <div className="lg:col-span-8 space-y-6">

          {/* Quick Actions Grid (Top) */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/duels" className="contents">
              <div className="system-window p-4 hover:bg-system-blue/10 transition-colors cursor-pointer group flex flex-col items-center justify-center h-32 border-system-blue/30 hover:border-system-blue">
                <Swords className="w-8 h-8 text-system-blue mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-rajdhani font-bold text-lg text-white">ARENA</span>
                <span className="font-tech text-xs text-muted-foreground">PVP DUELS</span>
              </div>
            </Link>
            <Link href="/leaderboard" className="contents">
              <div className="system-window p-4 hover:bg-system-green/10 transition-colors cursor-pointer group flex flex-col items-center justify-center h-32 border-system-green/30 hover:border-system-green">
                <Trophy className="w-8 h-8 text-system-green mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-rajdhani font-bold text-lg text-white">RANKINGS</span>
                <span className="font-tech text-xs text-muted-foreground">LEADERBOARD</span>
              </div>
            </Link>
            <Link href="/settings/htb" className="contents">
              <div className="system-window p-4 hover:bg-white/10 transition-colors cursor-pointer group flex flex-col items-center justify-center h-32 border-white/20 hover:border-white/50">
                <Terminal className="w-8 h-8 text-white/70 mb-2 group-hover:scale-110 transition-transform" />
                <span className="font-rajdhani font-bold text-lg text-white">CONFIG</span>
                <span className="font-tech text-xs text-muted-foreground">SETTINGS</span>
              </div>
            </Link>
          </div>

          {/* Active Quests & Activity */}
          <div className="grid md:grid-cols-2 gap-6">
            <SystemCard title="ACTIVE QUESTS" subtitle="TASKS" delay={3}>
              {!stats?.htbLinked ? (
                <div className="border border-system-red/30 bg-system-red/5 p-4 rounded-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded bg-system-red/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                      <LinkIcon className="w-4 h-4 text-system-red" />
                    </div>
                    <div>
                      <h4 className="font-rajdhani font-bold text-system-red mb-1">MAIN QUEST: LINK ACCOUNT</h4>
                      <p className="text-xs text-muted-foreground mb-3 font-tech">
                        Link your HackTheBox account to unlock full system capabilities.
                      </p>
                      <Link href="/settings/htb" className="text-xs bg-system-red hover:bg-system-red/80 text-black font-bold px-3 py-1 rounded-sm">
                        EXECUTE
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="border border-system-green/30 bg-system-green/5 p-3 rounded-sm flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Target className="w-5 h-5 text-system-green" />
                      <div>
                        <div className="font-rajdhani font-bold text-sm text-white">DAILY LOGIN</div>
                        <div className="text-xs font-tech text-muted-foreground">Log into the system</div>
                      </div>
                    </div>
                    <span className="text-xs bg-system-green/20 text-system-green px-2 py-1 rounded font-bold">COMPLETED</span>
                  </div>

                  <div className="border border-white/10 bg-black/40 p-3 rounded-sm flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-3">
                      <Swords className="w-5 h-5 text-white" />
                      <div>
                        <div className="font-rajdhani font-bold text-sm text-white">WIN A DUEL</div>
                        <div className="text-xs font-tech text-muted-foreground">Defeat an opponent</div>
                      </div>
                    </div>
                    <span className="text-xs bg-white/10 px-2 py-1 rounded">PENDING</span>
                  </div>
                </div>
              )}
            </SystemCard>

            <SystemCard title="SYSTEM LOG" subtitle="LATEST EVENTS" delay={4}>
              <div className="space-y-0 relative">
                {/* Timeline line */}
                <div className="absolute left-2 top-0 bottom-0 w-px bg-white/10" />

                {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
                  stats.recentTransactions.map((tx, i) => (
                    <div key={tx.id} className="relative pl-6 py-2 group">
                      <div className="absolute left-[3px] top-4 w-1.5 h-1.5 rounded-full bg-system-blue group-hover:bg-system-green transition-colors box-content border-2 border-black" />

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-bold font-rajdhani text-white group-hover:text-system-green transition-colors">
                            {tx.description}
                          </div>
                          <div className="text-xs font-tech text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`font-mono font-bold text-sm ${tx.points > 0 ? 'text-system-green' : 'text-system-red'}`}>
                          {tx.points > 0 ? '+' : ''}{tx.points}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 opacity-50 font-tech uppercase text-sm">
                    No logs found
                  </div>
                )}
              </div>
            </SystemCard>
          </div>
        </div>
      </div>
    </div>
  );
}
