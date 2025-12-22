'use client';

import { useEffect, useState } from 'react';
import { SystemCard } from '@/components/ui/SystemCard';
import { Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface Rank {
    id: string;
    name: string;
    display_name: string;
    points_required: number;
    color: string;
    order_index: number;
}

export default function AdminRanksPage() {
    const [ranks, setRanks] = useState<Rank[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Rank>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadRanks();
    }, []);

    const loadRanks = async () => {
        try {
            const { data } = await supabase
                .from('ranks')
                .select('*')
                .order('order_index', { ascending: true });

            setRanks(data || []);
        } catch (error) {
            console.error('Error loading ranks:', error);
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (rank: Rank) => {
        setEditingId(rank.id);
        setEditForm({ ...rank });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const saveEdit = async () => {
        if (!editingId || !editForm) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('ranks')
                .update({
                    display_name: editForm.display_name,
                    points_required: editForm.points_required,
                    color: editForm.color
                })
                .eq('id', editingId);

            if (!error) {
                await loadRanks();
                setEditingId(null);
                setEditForm({});
            }
        } catch (error) {
            console.error('Error saving rank:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SystemCard title="RANKS">
                <div className="text-center py-8 text-system-green font-tech animate-pulse">
                    LOADING...
                </div>
            </SystemCard>
        );
    }

    return (
        <SystemCard title="RANKS" subtitle="PROGRESSION SYSTEM">
            <div className="space-y-4">
                {ranks.map((rank) => {
                    const isEditing = editingId === rank.id;

                    return (
                        <div
                            key={rank.id}
                            className="p-4 bg-white/5 border border-white/10 rounded-sm space-y-3"
                        >
                            {isEditing ? (
                                <>
                                    {/* Edit Mode */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-tech text-muted-foreground block mb-1">
                                                DISPLAY NAME
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.display_name || ''}
                                                onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
                                                className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white font-rajdhani focus:border-system-blue focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-tech text-muted-foreground block mb-1">
                                                POINTS REQUIRED
                                            </label>
                                            <input
                                                type="number"
                                                value={editForm.points_required || 0}
                                                onChange={(e) => setEditForm({ ...editForm, points_required: parseInt(e.target.value) })}
                                                className="w-full px-3 py-2 bg-black border border-white/20 rounded text-white font-rajdhani focus:border-system-blue focus:outline-none"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-xs font-tech text-muted-foreground block mb-1">
                                                COLOR
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={editForm.color || '#FFFFFF'}
                                                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                                    className="w-12 h-10 bg-black border border-white/20 rounded cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={editForm.color || ''}
                                                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                                                    className="flex-1 px-3 py-2 bg-black border border-white/20 rounded text-white font-mono text-sm focus:border-system-blue focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={cancelEdit}
                                            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-sm font-tech text-sm transition-all"
                                        >
                                            <X className="w-4 h-4" />
                                            CANCEL
                                        </button>
                                        <button
                                            onClick={saveEdit}
                                            disabled={submitting}
                                            className="flex items-center gap-2 px-4 py-2 bg-system-green hover:bg-system-green/80 disabled:bg-white/10 text-black font-bold rounded-sm font-tech text-sm transition-all"
                                        >
                                            <Save className="w-4 h-4" />
                                            {submitting ? 'SAVING...' : 'SAVE'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* View Mode */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-full border-4 flex items-center justify-center font-rajdhani font-bold"
                                                style={{ borderColor: rank.color, color: rank.color }}
                                            >
                                                #{rank.order_index}
                                            </div>
                                            <div>
                                                <div
                                                    className="text-2xl font-rajdhani font-bold"
                                                    style={{ color: rank.color }}
                                                >
                                                    {rank.display_name}
                                                </div>
                                                <div className="text-xs font-tech text-muted-foreground">
                                                    {rank.points_required} points required
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => startEdit(rank)}
                                            className="flex items-center gap-2 px-4 py-2 bg-system-blue/20 hover:bg-system-blue/30 text-system-blue border border-system-blue/30 rounded-sm font-tech text-sm transition-all"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            EDIT
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>
        </SystemCard>
    );
}
