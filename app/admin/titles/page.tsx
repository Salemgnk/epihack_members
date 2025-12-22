'use client';

import { useEffect, useState } from 'react';
import { SystemCard } from '@/components/ui/SystemCard';
import { Plus, User } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface Title {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    color: string;
    icon: string | null;
}

export default function AdminTitlesPage() {
    const [titles, setTitles] = useState<Title[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newTitle, setNewTitle] = useState({
        name: '',
        display_name: '',
        description: '',
        color: '#9FEF00',
        icon: '🏆'
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadTitles();
    }, []);

    const loadTitles = async () => {
        try {
            const { data } = await supabase
                .from('titles')
                .select('*')
                .order('created_at', { ascending: false });

            setTitles(data || []);
        } catch (error) {
            console.error('Error loading titles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTitle = async () => {
        if (!newTitle.name || !newTitle.display_name) return;

        setSubmitting(true);
        try {
            const { error } = await supabase
                .from('titles')
                .insert({
                    name: newTitle.name.toLowerCase().replace(/\s+/g, '_'),
                    display_name: newTitle.display_name,
                    description: newTitle.description || null,
                    color: newTitle.color,
                    icon: newTitle.icon || null,
                    is_special: true
                });

            if (!error) {
                await loadTitles();
                setShowCreateForm(false);
                setNewTitle({
                    name: '',
                    display_name: '',
                    description: '',
                    color: '#9FEF00',
                    icon: '🏆'
                });
            }
        } catch (error) {
            console.error('Error creating title:', error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SystemCard title="TITLES">
                <div className="text-center py-8 text-system-green font-tech animate-pulse">
                    LOADING...
                </div>
            </SystemCard>
        );
    }

    return (
        <div className="space-y-6">
            {/* Titles List */}
            <SystemCard title="SPECIAL TITLES" subtitle={`${titles.length} TOTAL`}>
                <div className="space-y-3">
                    {/* Create Button */}
                    <button
                        onClick={() => setShowCreateForm(!showCreateForm)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-system-green/20 hover:bg-system-green/30 text-system-green border border-system-green/30 rounded-sm font-tech text-sm transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        CREATE NEW TITLE
                    </button>

                    {/* Create Form */}
                    {showCreateForm && (
                        <div className="p-4 bg-black border border-system-green/30 rounded-sm space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-tech text-muted-foreground block mb-1">
                                        NAME (INTERNAL)
                                    </label>
                                    <input
                                        type="text"
                                        value={newTitle.name}
                                        onChange={(e) => setNewTitle({ ...newTitle, name: e.target.value })}
                                        placeholder="ctf_master"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white font-mono text-sm focus:border-system-green focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-tech text-muted-foreground block mb-1">
                                        DISPLAY NAME
                                    </label>
                                    <input
                                        type="text"
                                        value={newTitle.display_name}
                                        onChange={(e) => setNewTitle({ ...newTitle, display_name: e.target.value })}
                                        placeholder="CTF Master"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white font-rajdhani focus:border-system-green focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-tech text-muted-foreground block mb-1">
                                    DESCRIPTION
                                </label>
                                <textarea
                                    value={newTitle.description}
                                    onChange={(e) => setNewTitle({ ...newTitle, description: e.target.value })}
                                    placeholder="Won 3+ CTF competitions..."
                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-white font-tech text-sm focus:border-system-green focus:outline-none resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-tech text-muted-foreground block mb-1">
                                        COLOR
                                    </label>
                                    <input
                                        type="color"
                                        value={newTitle.color}
                                        onChange={(e) => setNewTitle({ ...newTitle, color: e.target.value })}
                                        className="w-full h-10 bg-white/5 border border-white/20 rounded cursor-pointer"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-tech text-muted-foreground block mb-1">
                                        ICON (EMOJI)
                                    </label>
                                    <input
                                        type="text"
                                        value={newTitle.icon}
                                        onChange={(e) => setNewTitle({ ...newTitle, icon: e.target.value })}
                                        placeholder="🏆"
                                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded text-2xl text-center focus:border-system-green focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowCreateForm(false)}
                                    className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-sm font-tech text-sm transition-all"
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handleCreateTitle}
                                    disabled={!newTitle.name || !newTitle.display_name || submitting}
                                    className="flex-1 px-4 py-2 bg-system-green hover:bg-system-green/80 disabled:bg-white/10 disabled:text-white/40 text-black font-bold rounded-sm font-tech text-sm transition-all"
                                >
                                    {submitting ? 'CREATING...' : 'CREATE TITLE'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Titles List */}
                    <div className="space-y-2">
                        {titles.map((title) => (
                            <div
                                key={title.id}
                                className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-sm hover:border-white/30 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    {title.icon && (
                                        <div className="text-2xl">{title.icon}</div>
                                    )}
                                    <div>
                                        <div
                                            className="font-rajdhani font-bold"
                                            style={{ color: title.color }}
                                        >
                                            {title.display_name}
                                        </div>
                                        {title.description && (
                                            <div className="text-xs text-muted-foreground font-tech">
                                                {title.description}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-xs font-mono text-muted-foreground">
                                    {title.name}
                                </div>
                            </div>
                        ))}

                        {titles.length === 0 && !showCreateForm && (
                            <div className="text-center py-8 text-muted-foreground font-tech">
                                No titles created yet
                            </div>
                        )}
                    </div>
                </div>
            </SystemCard>

            {/* Note */}
            <div className="p-4 bg-system-blue/10 border border-system-blue/30 rounded-sm">
                <p className="text-xs font-tech text-system-blue">
                    ℹ️ Title assignment feature coming soon. For now, assign titles via Supabase Dashboard (user_titles table).
                </p>
            </div>
        </div>
    );
}
