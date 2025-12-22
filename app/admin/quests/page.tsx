'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SystemCard } from '@/components/ui/SystemCard';
import { Plus, Edit, Trash2, Users, Eye, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import AssignQuestModal from '@/components/admin/AssignQuestModal';

interface Quest {
    id: string;
    title: string;
    description: string;
    points_reward: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'insane';
    category_id: string | null;
    quest_type: 'manual' | 'auto';
    deadline: string | null;
    penalty_percentage: number;
    active: boolean;
    created_at: string;
    category?: {
        name: string;
        color: string;
        icon: string;
    };
}

interface Category {
    id: string;
    name: string;
    description: string;
    color: string;
    icon: string;
}

export default function AdminQuestsPage() {
    const router = useRouter();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'quests' | 'categories'>('quests');
    const [assignModalQuest, setAssignModalQuest] = useState<{ id: string; title: string } | null>(null);

    useEffect(() => {
        loadQuests();
        loadCategories();
    }, []);

    const loadQuests = async () => {
        try {
            const response = await fetch('/api/quests');
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

    const deleteQuest = async (questId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette quête ?')) return;

        try {
            const response = await fetch(`/api/quests/${questId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                loadQuests();
            }
        } catch (error) {
            console.error('Error deleting quest:', error);
        }
    };

    const deleteCategory = async (categoryId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;

        try {
            const response = await fetch(`/api/quests/categories/${categoryId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                loadCategories();
            }
        } catch (error) {
            console.error('Error deleting category:', error);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            case 'hard': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
            case 'insane': return 'text-red-400 bg-red-400/10 border-red-400/30';
            default: return 'text-white/50 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-4xl font-black font-rajdhani text-white tracking-wider mb-1 animate-glitch">
                        ADMIN - QUÊTES
                    </h1>
                    <p className="font-tech text-system-blue text-sm tracking-widest uppercase">
                        Gestion complète du système
                    </p>
                </div>
                {activeTab === 'quests' && (
                    <Link
                        href="/admin/quests/create"
                        className="px-6 py-3 bg-system-green hover:bg-system-green/80 text-black font-rajdhani font-bold rounded transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        CRÉER QUÊTE
                    </Link>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('quests')}
                    className={`px-6 py-3 rounded font-rajdhani font-bold transition-colors ${activeTab === 'quests'
                        ? 'bg-system-blue text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    QUÊTES ({quests.length})
                </button>
                <button
                    onClick={() => setActiveTab('categories')}
                    className={`px-6 py-3 rounded font-rajdhani font-bold transition-colors ${activeTab === 'categories'
                        ? 'bg-system-blue text-black'
                        : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    CATÉGORIES ({categories.length})
                </button>
            </div>

            {/* Content */}
            {activeTab === 'quests' ? (
                <div className="space-y-4">
                    {quests.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="font-tech text-muted-foreground mb-4">Aucune quête créée</p>
                            <Link
                                href="/admin/quests/create"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-system-blue hover:bg-system-blue/80 text-black font-rajdhani font-bold rounded transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                CRÉER LA PREMIÈRE QUÊTE
                            </Link>
                        </div>
                    ) : (
                        quests.map((quest) => (
                            <div key={quest.id} className="system-window p-6">
                                <div className="flex items-start justify-between gap-4">
                                    {/* Quest Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            {quest.category && (
                                                <span
                                                    className="px-3 py-1 text-xs font-bold rounded border"
                                                    style={{
                                                        backgroundColor: `${quest.category.color}20`,
                                                        color: quest.category.color,
                                                        borderColor: `${quest.category.color}50`,
                                                    }}
                                                >
                                                    {quest.category.icon} {quest.category.name}
                                                </span>
                                            )}
                                            <span className={`px-3 py-1 text-xs font-bold rounded border ${getDifficultyColor(quest.difficulty)}`}>
                                                {quest.difficulty.toUpperCase()}
                                            </span>
                                            <span className={`px-3 py-1 text-xs font-bold rounded border ${quest.active
                                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                                                }`}>
                                                {quest.active ? <CheckCircle className="w-3 h-3 inline" /> : <XCircle className="w-3 h-3 inline" />}
                                                {' '}{quest.active ? 'ACTIVE' : 'INACTIVE'}
                                            </span>
                                        </div>

                                        <h3 className="font-rajdhani font-bold text-xl text-white mb-2">
                                            {quest.title}
                                        </h3>

                                        <p className="font-tech text-sm text-muted-foreground mb-3 line-clamp-2">
                                            {quest.description}
                                        </p>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="font-tech text-yellow-400">
                                                🏆 {quest.points_reward} points
                                            </div>
                                            <div className="font-tech text-muted-foreground">
                                                {quest.quest_type === 'auto' ? '🤖 Auto' : '👤 Manuel'}
                                            </div>
                                            {quest.deadline && (
                                                <div className="font-tech text-muted-foreground">
                                                    ⏰ {new Date(quest.deadline).toLocaleDateString()}
                                                </div>
                                            )}
                                            <div className="font-tech text-orange-400">
                                                ⚠️ -{quest.penalty_percentage}% si late
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            href={`/admin/quests/${quest.id}/submissions`}
                                            className="px-4 py-2 bg-system-blue hover:bg-system-blue/80 text-black font-rajdhani font-bold rounded transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            SOUMISSIONS
                                        </Link>
                                        <button
                                            onClick={() => setAssignModalQuest({ id: quest.id, title: quest.title })}
                                            className="px-4 py-2 bg-system-green hover:bg-system-green/80 text-black font-rajdhani font-bold rounded transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <Users className="w-4 h-4" />
                                            ASSIGNER
                                        </button>
                                        <button
                                            onClick={() => router.push(`/admin/quests/${quest.id}/edit`)}
                                            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-rajdhani font-bold rounded transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <Edit className="w-4 h-4" />
                                            MODIFIER
                                        </button>
                                        <button
                                            onClick={() => deleteQuest(quest.id)}
                                            className="px-4 py-2 bg-system-red hover:bg-system-red/80 text-black font-rajdhani font-bold rounded transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            SUPPRIMER
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                        <div key={category.id} className="system-window p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div
                                    className="text-4xl"
                                    style={{ color: category.color }}
                                >
                                    {category.icon}
                                </div>
                                <button
                                    onClick={() => deleteCategory(category.id)}
                                    className="text-system-red hover:text-system-red/80 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <h3
                                className="font-rajdhani font-bold text-lg mb-2"
                                style={{ color: category.color }}
                            >
                                {category.name}
                            </h3>
                            <p className="font-tech text-xs text-muted-foreground">
                                {category.description || 'Pas de description'}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
