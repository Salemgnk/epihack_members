'use client';

import { useEffect, useState } from 'react';
import { SystemCard } from '@/components/ui/SystemCard';
import { Plus, Minus, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface Member {
    id: string;
    email: string;
    total_points: number;
    rank_name: string;
    rank_color: string;
    htb_username: string | null;
}

export default function AdminMembersPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [adjustAmount, setAdjustAmount] = useState('');
    const [adjustReason, setAdjustReason] = useState('');
    const [isPositive, setIsPositive] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            const response = await fetch('/api/admin/members');
            const data = await response.json();
            setMembers(data.members || []);
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustPoints = async () => {
        if (!selectedMember || !adjustAmount) return;

        setSubmitting(true);
        try {
            const amount = parseInt(adjustAmount) * (isPositive ? 1 : -1);

            const response = await fetch(`/api/admin/members/${selectedMember.id}/points`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    description: adjustReason || 'Admin adjustment'
                })
            });

            if (response.ok) {
                // Reload members
                await loadMembers();
                // Close modal
                setSelectedMember(null);
                setAdjustAmount('');
                setAdjustReason('');
            }
        } catch (error) {
            console.error('Error adjusting points:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SystemCard title="MEMBERS">
                <div className="text-center py-8 text-system-green font-tech animate-pulse">
                    LOADING...
                </div>
            </SystemCard>
        );
    }

    return (
        <>
            <SystemCard title="MEMBERS" subtitle={`${members.length} TOTAL`}>
                <div className="space-y-2">
                    {/* Header */}
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-white/10 text-xs font-tech text-muted-foreground">
                        <div className="col-span-4">EMAIL</div>
                        <div className="col-span-2">POINTS</div>
                        <div className="col-span-2">RANK</div>
                        <div className="col-span-2">HTB</div>
                        <div className="col-span-2 text-right">ACTIONS</div>
                    </div>

                    {/* Members List */}
                    {members.map((member) => (
                        <div
                            key={member.id}
                            className="grid grid-cols-12 gap-4 px-4 py-3 bg-white/5 border border-white/10 rounded-sm hover:border-system-green/50 transition-all"
                        >
                            <div className="col-span-4 font-tech text-white text-sm truncate">
                                {member.email}
                            </div>
                            <div className="col-span-2 font-rajdhani font-bold text-system-green">
                                {member.total_points}
                            </div>
                            <div className="col-span-2">
                                <span
                                    className="text-sm font-rajdhani font-bold"
                                    style={{ color: member.rank_color }}
                                >
                                    {member.rank_name}
                                </span>
                            </div>
                            <div className="col-span-2">
                                {member.htb_username ? (
                                    <span className="text-xs px-2 py-1 bg-system-green/20 text-system-green rounded font-tech">
                                        {member.htb_username}
                                    </span>
                                ) : (
                                    <span className="text-xs text-muted-foreground font-tech">N/A</span>
                                )}
                            </div>
                            <div className="col-span-2 flex justify-end">
                                <button
                                    onClick={() => setSelectedMember(member)}
                                    className="px-3 py-1 bg-system-blue/20 hover:bg-system-blue/30 text-system-blue border border-system-blue/30 rounded-sm text-xs font-tech transition-all"
                                >
                                    ADJUST
                                </button>
                            </div>
                        </div>
                    ))}

                    {members.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground font-tech">
                            No members found
                        </div>
                    )}
                </div>
            </SystemCard>

            {/* Adjust Points Modal */}
            {selectedMember && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-system-panel border border-system-blue/30 rounded-sm p-6 max-w-md w-full space-y-4">
                        <h3 className="text-2xl font-rajdhani font-bold text-system-blue">
                            ADJUST POINTS
                        </h3>

                        <div className="space-y-2">
                            <div className="text-xs font-tech text-muted-foreground">USER</div>
                            <div className="font-tech text-white">{selectedMember.email}</div>
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs font-tech text-muted-foreground">CURRENT POINTS</div>
                            <div className="font-rajdhani font-bold text-2xl text-system-green">
                                {selectedMember.total_points}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setIsPositive(true)}
                                    className={`flex-1 px-4 py-2 rounded-sm font-tech text-sm transition-all ${isPositive
                                            ? 'bg-system-green text-black font-bold'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    <Plus className="w-4 h-4 inline mr-1" />
                                    ADD
                                </button>
                                <button
                                    onClick={() => setIsPositive(false)}
                                    className={`flex-1 px-4 py-2 rounded-sm font-tech text-sm transition-all ${!isPositive
                                            ? 'bg-system-red text-black font-bold'
                                            : 'bg-white/5 text-white/60 hover:bg-white/10'
                                        }`}
                                >
                                    <Minus className="w-4 h-4 inline mr-1" />
                                    REMOVE
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-tech text-muted-foreground">AMOUNT</label>
                            <input
                                type="number"
                                value={adjustAmount}
                                onChange={(e) => setAdjustAmount(e.target.value)}
                                className="w-full px-4 py-2 bg-black border border-white/20 rounded-sm text-white font-rajdhani text-lg focus:border-system-blue focus:outline-none"
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-tech text-muted-foreground">REASON (OPTIONAL)</label>
                            <input
                                type="text"
                                value={adjustReason}
                                onChange={(e) => setAdjustReason(e.target.value)}
                                className="w-full px-4 py-2 bg-black border border-white/20 rounded-sm text-white font-tech text-sm focus:border-system-blue focus:outline-none"
                                placeholder="Admin adjustment"
                            />
                        </div>

                        <div className="flex gap-2 pt-4">
                            <button
                                onClick={() => {
                                    setSelectedMember(null);
                                    setAdjustAmount('');
                                    setAdjustReason('');
                                }}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-sm font-tech text-sm transition-all"
                                disabled={submitting}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleAdjustPoints}
                                disabled={!adjustAmount || submitting}
                                className="flex-1 px-4 py-2 bg-system-blue hover:bg-system-blue/80 disabled:bg-white/10 disabled:text-white/40 text-black font-bold rounded-sm font-tech text-sm transition-all"
                            >
                                {submitting ? 'PROCESSING...' : 'CONFIRM'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
