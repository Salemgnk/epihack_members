'use client';

import { Clock, Trophy, AlertTriangle } from 'lucide-react';

interface QuestCardProps {
    quest: {
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
    };
    memberQuest?: {
        id: string;
        status: 'assigned' | 'in_progress' | 'completed' | 'failed' | 'late';
        was_late: boolean;
        points_earned: number | null;
        started_at: string | null;
    };
    onAction?: (action: 'start' | 'submit' | 'view') => void;
}

export function QuestCard({ quest, memberQuest, onAction }: QuestCardProps) {
    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return 'text-green-400 bg-green-400/10 border-green-400/30';
            case 'medium':
                return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
            case 'hard':
                return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
            case 'insane':
                return 'text-red-400 bg-red-400/10 border-red-400/30';
            default:
                return 'text-white/50 bg-white/5 border-white/10';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'assigned':
                return <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-bold rounded border border-blue-500/30">NOUVEAU</span>;
            case 'in_progress':
                return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded border border-yellow-500/30">EN COURS</span>;
            case 'completed':
                return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded border border-green-500/30">COMPLÉTÉ</span>;
            case 'late':
                return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded border border-orange-500/30">EN RETARD</span>;
            case 'failed':
                return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30">ÉCHOUÉ</span>;
            default:
                return null;
        }
    };

    const getTimeRemaining = () => {
        if (!quest.deadline) return null;

        const now = new Date();
        const deadline = new Date(quest.deadline);
        const diff = deadline.getTime() - now.getTime();

        if (diff < 0) return { text: 'Expiré', isUrgent: true };

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        const isUrgent = days < 2;

        if (days > 0) {
            return { text: `${days}j ${hours}h restantes`, isUrgent };
        } else {
            return { text: `${hours}h restantes`, isUrgent };
        }
    };

    const timeInfo = getTimeRemaining();
    const isCompleted = memberQuest?.status === 'completed';
    const isDisabled = isCompleted;

    const getActionButton = () => {
        if (!memberQuest) return null;

        if (isCompleted) {
            return (
                <button
                    disabled
                    className="w-full py-2 bg-white/5 text-white/30 font-rajdhani font-bold rounded border border-white/10 cursor-not-allowed"
                >
                    DÉJÀ COMPLÉTÉ
                </button>
            );
        }

        if (memberQuest.status === 'assigned') {
            return (
                <button
                    onClick={() => onAction?.('start')}
                    className="w-full py-2 bg-system-blue hover:bg-system-blue/80 text-black font-rajdhani font-bold rounded transition-colors"
                >
                    COMMENCER
                </button>
            );
        }

        if (memberQuest.status === 'in_progress' || memberQuest.status === 'late') {
            return (
                <button
                    onClick={() => onAction?.('submit')}
                    className="w-full py-2 bg-system-green hover:bg-system-green/80 text-black font-rajdhani font-bold rounded transition-colors"
                >
                    SOUMETTRE
                </button>
            );
        }

        return (
            <button
                onClick={() => onAction?.('view')}
                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-rajdhani font-bold rounded transition-colors"
            >
                VOIR DÉTAILS
            </button>
        );
    };

    return (
        <div className={`system-window p-4 ${isDisabled ? 'opacity-60' : ''}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        {quest.category && (
                            <span
                                className="px-2 py-1 text-xs font-bold rounded border"
                                style={{
                                    backgroundColor: `${quest.category.color}20`,
                                    color: quest.category.color,
                                    borderColor: `${quest.category.color}50`,
                                }}
                            >
                                {quest.category.icon} {quest.category.name}
                            </span>
                        )}
                        <span className={`px-2 py-1 text-xs font-bold rounded border ${getDifficultyColor(quest.difficulty)}`}>
                            {quest.difficulty.toUpperCase()}
                        </span>
                    </div>
                    <h3 className="font-rajdhani font-bold text-lg text-white mb-1">
                        {quest.title}
                    </h3>
                </div>
                {memberQuest && getStatusBadge(memberQuest.status)}
            </div>

            {/* Description */}
            <p className="font-tech text-sm text-muted-foreground mb-4 line-clamp-2">
                {quest.description}
            </p>

            {/* Info Row */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                    {/* Points */}
                    <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-system-green" />
                        <span className="font-rajdhani font-bold text-system-green">
                            {memberQuest?.was_late && memberQuest.points_earned !== null
                                ? `${memberQuest.points_earned} (-${quest.penalty_percentage}%)`
                                : quest.points_reward}
                        </span>
                    </div>

                    {/* Deadline */}
                    {timeInfo && (
                        <div className={`flex items-center gap-1 ${timeInfo.isUrgent ? 'text-system-red' : 'text-muted-foreground'}`}>
                            <Clock className="w-4 h-4" />
                            <span className="font-tech text-xs">{timeInfo.text}</span>
                        </div>
                    )}
                </div>

                {/* Late Warning */}
                {memberQuest?.was_late && (
                    <div className="flex items-center gap-1 text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-tech text-xs">-{quest.penalty_percentage}% pénalité</span>
                    </div>
                )}
            </div>

            {/* Action Button */}
            {getActionButton()}
        </div>
    );
}
