'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/toast';
import { Swords, Clock, Trophy, Loader2, PlayCircle, XCircle, CheckCircle } from 'lucide-react';
import { SystemCard } from '@/components/ui/SystemCard';

interface Duel {
    id: string;
    challenger_id: string;
    challenged_id: string;
    htb_machine_name: string;
    htb_machine_difficulty: string;
    status: string;
    challenger_stake: number;
    challenged_stake: number;
    duration_hours: number;
    started_at: string | null;
    ends_at: string | null;
    challenger: { id: string; full_name: string; avatar_url: string };
    challenged: { id: string; full_name: string; avatar_url: string };
}

export default function DuelsPage() {
    const [duels, setDuels] = useState<Duel[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'active' | 'pending' | 'completed'>('active');
    const { showToast } = useToast();

    useEffect(() => {
        loadDuels();
    }, [filter]);

    const loadDuels = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/duels?status=${filter}`, {
                credentials: 'include',
            });
            const data = await response.json();

            if (response.ok) {
                setDuels(data.duels || []);
            } else {
                showToast(data.error || 'Erreur de chargement', 'error');
            }
        } catch (error) {
            console.error('Load duels error:', error);
            showToast('Erreur de chargement', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRespondToDuel = async (duelId: string, action: 'accept' | 'refuse', stake: number = 0) => {
        try {
            const response = await fetch(`/api/duels/${duelId}/respond`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, stake }),
            });

            const data = await response.json();

            if (response.ok) {
                showToast(data.message, 'success');
                loadDuels();
            } else {
                showToast(data.error || 'Erreur', 'error');
            }
        } catch (error) {
            console.error('Respond error:', error);
            showToast('Erreur lors de la réponse', 'error');
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy': return 'text-system-green';
            case 'medium': return 'text-yellow-500';
            case 'hard': return 'text-orange-500';
            case 'insane': return 'text-system-red';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-4xl font-black font-rajdhani text-white tracking-wider mb-2 animate-glitch">
                        PVP ARENA
                    </h1>
                    <p className="font-tech text-system-red text-sm tracking-widest uppercase">
                        Tactical Combat Operations
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex justify-center mb-8">
                <div className="inline-flex rounded-sm bg-black/40 border border-white/10 p-1">
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-6 py-2 rounded-sm font-tech text-xs uppercase tracking-wider transition-all ${filter === 'active'
                            ? 'bg-system-red text-black border border-system-red shadow-[0_0_10px_rgba(255,42,42,0.4)]'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Active Battles
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-6 py-2 rounded-sm font-tech text-xs uppercase tracking-wider transition-all ${filter === 'pending'
                            ? 'bg-yellow-500 text-black border border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Pending Invites
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-6 py-2 rounded-sm font-tech text-xs uppercase tracking-wider transition-all ${filter === 'completed'
                            ? 'bg-system-green text-black border border-system-green shadow-[0_0_10px_rgba(0,255,157,0.4)]'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                    >
                        Battle History
                    </button>
                </div>
            </div>

            {/* Duels List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-system-red/20 border-t-system-red rounded-full animate-spin" />
                        <p className="font-rajdhani text-system-red animate-pulse">LOADING BATTLE DATA...</p>
                    </div>
                </div>
            ) : duels.length === 0 ? (
                <div className="text-center py-20 border border-white/10 rounded-lg bg-black/40">
                    <Swords className="w-16 h-16 mx-auto mb-4 text-white/20" />
                    <p className="font-tech text-white/50 uppercase">No Operations Found</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {duels.map((duel, i) => (
                        <div
                            key={duel.id}
                            className="system-window p-0 relative overflow-hidden group hover:border-system-red/50 transition-colors"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-system-red/50" />

                            <div className="grid md:grid-cols-12 gap-6 p-6 items-center">
                                {/* Header / Info */}
                                <div className="md:col-span-3">
                                    <div className="font-tech text-xs text-muted-foreground uppercase mb-1">TARGET SYSTEM</div>
                                    <h3 className="text-xl font-bold font-rajdhani text-white mb-1">{duel.htb_machine_name}</h3>
                                    <span className={`text-xs font-bold uppercase tracking-wider ${getDifficultyColor(duel.htb_machine_difficulty)}`}>
                                        {duel.htb_machine_difficulty?.toUpperCase()}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 font-tech">
                                        <Clock className="w-3 h-3" />
                                        WINDOW: {duel.duration_hours}H
                                    </div>
                                </div>

                                {/* Combatants */}
                                <div className="md:col-span-6 flex items-center justify-center gap-8">
                                    {/* Challenger */}
                                    <div className="text-center group-hover:scale-105 transition-transform">
                                        <div className="w-16 h-16 rounded-full border-2 border-system-blue p-1 mb-2 mx-auto relative">
                                            <div className="w-full h-full rounded-full overflow-hidden">
                                                {duel.challenger.avatar_url ? (
                                                    <img src={duel.challenger.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-system-blue/20 flex items-center justify-center font-bold text-system-blue">
                                                        {duel.challenger.full_name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            {duel.challenger_stake > 0 && (
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black border border-system-blue text-system-blue text-[10px] px-2 py-0.5 rounded font-tech">
                                                    {duel.challenger_stake} PTS
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold font-rajdhani text-white">{duel.challenger.full_name}</p>
                                    </div>

                                    <div className="flex flex-col items-center">
                                        <Swords className="w-8 h-8 text-system-red animate-pulse" />
                                        <div className="text-xs font-tech text-system-red mt-1">VS</div>
                                    </div>

                                    {/* Challenged */}
                                    <div className="text-center group-hover:scale-105 transition-transform">
                                        <div className="w-16 h-16 rounded-full border-2 border-system-red p-1 mb-2 mx-auto relative">
                                            <div className="w-full h-full rounded-full overflow-hidden">
                                                {duel.challenged.avatar_url ? (
                                                    <img src={duel.challenged.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-system-red/20 flex items-center justify-center font-bold text-system-red">
                                                        {duel.challenged.full_name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            {duel.challenged_stake > 0 && (
                                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black border border-system-red text-system-red text-[10px] px-2 py-0.5 rounded font-tech">
                                                    {duel.challenged_stake} PTS
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold font-rajdhani text-white">{duel.challenged.full_name}</p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="md:col-span-3 flex justify-end">
                                    {duel.status === 'pending' && (
                                        <div className="flex flex-col gap-2 w-full">
                                            <button
                                                onClick={() => handleRespondToDuel(duel.id, 'accept', duel.challenger_stake)}
                                                className="w-full py-2 bg-system-green/20 hover:bg-system-green/30 text-system-green border border-system-green/50 hover:border-system-green p-1 rounded font-rajdhani font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-sm"
                                            >
                                                <CheckCircle className="w-4 h-4" /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleRespondToDuel(duel.id, 'refuse')}
                                                className="w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 hover:border-red-500 p-1 rounded font-rajdhani font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wider text-sm"
                                            >
                                                <XCircle className="w-4 h-4" /> Decline
                                            </button>
                                        </div>
                                    )}
                                    {duel.status === 'active' && duel.ends_at && (
                                        <div className="w-full text-right p-3 bg-white/5 border border-white/10 rounded">
                                            <div className="text-[10px] text-muted-foreground font-tech uppercase mb-1">Mission Timer</div>
                                            <div className="text-white font-rajdhani font-bold">
                                                {new Date(duel.ends_at).toLocaleString('fr-FR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    )}
                                    {duel.status === 'completed' && (
                                        <div className="w-full text-right p-3 bg-white/5 border border-white/10 rounded opacity-50">
                                            <div className="text-[10px] text-muted-foreground font-tech uppercase mb-1">Status</div>
                                            <div className="text-white font-rajdhani font-bold uppercase">
                                                Completed
                                            </div>
                                        </div>
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
