'use client';

import { useEffect, useState } from 'react';
import { SystemCard } from '@/components/ui/SystemCard';
import { QuestCard } from '@/components/quests/QuestCard';
import { QuestSubmissionModal } from '@/components/quests/QuestSubmissionModal';
import { Filter, TrendingUp } from 'lucide-react';

interface Quest {
    id: string;
    title: string;
    description: string;
    points_reward: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'insane';
    deadline: string | null;
    penalty_percentage: number;
    category?: {
        name: string;
        color: string;
        icon: string;
    };
}

interface MemberQuest {
    id: string;
    quest_id: string;
    status: 'assigned' | 'in_progress' | 'completed' | 'failed' | 'late';
    was_late: boolean;
    points_earned: number | null;
    started_at: string | null;
    quest: Quest;
}

export default function QuestsPage() {
    const [quests, setQuests] = useState<MemberQuest[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

    useEffect(() => {
        loadQuests();
        loadCategories();
    }, [filter, categoryFilter]);

    const loadQuests = async () => {
        try {
            let url = '/api/quests?assigned_to_me=true';

            if (filter === 'active') {
                url += '&status=in_progress,assigned,late';
            } else if (filter === 'completed') {
                url += '&status=completed';
            }

            if (categoryFilter !== 'all') {
                url += `&category=${categoryFilter}`;
            }

            const response = await fetch(url);
            const data = await response.json();
            setQuests(data.quests || []);
        } catch (error) {
            console.error('Error loading quests:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadCategories = async () => {
        try {
            const response = await fetch('/api/quests/categories');
            const data = await response.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleQuestAction = async (quest: MemberQuest, action: 'start' | 'submit' | 'view') => {
        if (action === 'start') {
            // Start quest - just update status to in_progress
            try {
                await fetch(`/api/quests/${quest.quest_id}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        submissionData: { started: true },
                    }),
                });
                loadQuests();
            } catch (error) {
                console.error('Error starting quest:', error);
            }
        } else if (action === 'submit') {
            setSelectedQuest(quest.quest);
            setIsSubmitModalOpen(true);
        }
    };

    const handleSubmitQuest = async (data: { text: string; files?: File[] }) => {
        if (!selectedQuest) return;

        try {
            // For now, we'll just send the text data
            // File upload would require additional setup with storage
            await fetch(`/api/quests/${selectedQuest.id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    submissionData: {
                        text: data.text,
                        submittedAt: new Date().toISOString(),
                    },
                }),
            });

            loadQuests();
        } catch (error) {
            console.error('Error submitting quest:', error);
            throw error;
        }
    };

    const stats = {
        total: quests.length,
        completed: quests.filter(q => q.status === 'completed').length,
        pointsEarned: quests
            .filter(q => q.points_earned)
            .reduce((sum, q) => sum + (q.points_earned || 0), 0),
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-system-bg">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-system-blue/30 border-t-system-blue rounded-full animate-spin" />
                    <p className="font-rajdhani text-system-blue animate-pulse">LOADING QUESTS...</p>
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
                        QUÊTES
                    </h1>
                    <p className="font-tech text-system-blue text-sm tracking-widest uppercase">
                        Missions et défis
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <SystemCard title="TOTAL" glowing delay={1}>
                    <div className="text-center">
                        <div className="text-4xl font-bold font-rajdhani text-system-blue mb-1">
                            {stats.total}
                        </div>
                        <div className="text-xs font-tech text-muted-foreground">Quêtes assignées</div>
                    </div>
                </SystemCard>

                <SystemCard title="COMPLÉTÉES" glowing delay={2}>
                    <div className="text-center">
                        <div className="text-4xl font-bold font-rajdhani text-system-green mb-1">
                            {stats.completed}
                        </div>
                        <div className="text-xs font-tech text-muted-foreground">
                            Taux: {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                        </div>
                    </div>
                </SystemCard>

                <SystemCard title="POINTS GAGNÉS" glowing delay={3}>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <TrendingUp className="w-6 h-6 text-yellow-400" />
                            <div className="text-4xl font-bold font-rajdhani text-yellow-400">
                                {stats.pointsEarned}
                            </div>
                        </div>
                        <div className="text-xs font-tech text-muted-foreground">Via quêtes</div>
                    </div>
                </SystemCard>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                {/* Status Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded font-tech text-sm transition-colors ${filter === 'all'
                                ? 'bg-system-blue text-black'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        TOUTES
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-4 py-2 rounded font-tech text-sm transition-colors ${filter === 'active'
                                ? 'bg-system-blue text-black'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        ACTIVES
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-4 py-2 rounded font-tech text-sm transition-colors ${filter === 'completed'
                                ? 'bg-system-blue text-black'
                                : 'bg-white/10 text-white hover:bg-white/20'
                            }`}
                    >
                        COMPLÉTÉES
                    </button>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-white/10 text-white border border-white/20 rounded px-4 py-2 font-tech text-sm"
                    >
                        <option value="all">Toutes catégories</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Quests Grid */}
            {quests.length === 0 ? (
                <div className="text-center py-16">
                    <Filter className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="font-tech text-muted-foreground">Aucune quête trouvée</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quests.map((mq) => (
                        <QuestCard
                            key={mq.id}
                            quest={mq.quest}
                            memberQuest={mq}
                            onAction={(action) => handleQuestAction(mq, action)}
                        />
                    ))}
                </div>
            )}

            {/* Submission Modal */}
            {selectedQuest && (
                <QuestSubmissionModal
                    quest={selectedQuest}
                    isOpen={isSubmitModalOpen}
                    onClose={() => {
                        setIsSubmitModalOpen(false);
                        setSelectedQuest(null);
                    }}
                    onSubmit={handleSubmitQuest}
                />
            )}
        </div>
    );
}
