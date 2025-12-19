'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import Link from 'next/link';

interface MemberQuest {
    id: string;
    member_id: string;
    status: string;
    assigned_at: string;
    started_at: string | null;
    completed_at: string | null;
    submission_data: any;
    points_earned: number | null;
    was_late: boolean;
    profiles: {
        display_name: string;
        avatar_url: string | null;
    };
}

interface Quest {
    id: string;
    title: string;
    points_reward: number;
    penalty_percentage: number;
    deadline: string | null;
}

export default function QuestSubmissionsPage() {
    const router = useRouter();
    const params = useParams();
    const questId = params?.id as string;

    const [quest, setQuest] = useState<Quest | null>(null);
    const [submissions, setSubmissions] = useState<MemberQuest[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
    const [selectedSubmission, setSelectedSubmission] = useState<MemberQuest | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [validating, setValidating] = useState(false);

    useEffect(() => {
        if (questId) {
            loadSubmissions();
        }
    }, [questId, filter]);

    const loadSubmissions = async () => {
        try {
            // Get quest details
            const questRes = await fetch(`/api/quests?id=${questId}`);
            const questData = await questRes.json();
            if (questData.quests?.[0]) {
                setQuest(questData.quests[0]);
            }

            // Get submissions (member_quests for this quest)
            const res = await fetch(`/api/quests/${questId}/submissions`);
            const data = await res.json();

            let filtered = data.submissions || [];
            if (filter === 'pending') {
                filtered = filtered.filter((s: MemberQuest) =>
                    s.status === 'in_progress' || s.status === 'late'
                );
            } else if (filter === 'completed') {
                filtered = filtered.filter((s: MemberQuest) => s.status === 'completed');
            }

            setSubmissions(filtered);
        } catch (error) {
            console.error('Error loading submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleValidate = async (approved: boolean) => {
        if (!selectedSubmission) return;

        setValidating(true);
        try {
            const response = await fetch(`/api/quests/${questId}/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberQuestId: selectedSubmission.id,
                    action: approved ? 'approve' : 'reject',
                    feedback: feedback || undefined,
                }),
            });

            if (response.ok) {
                setShowFeedbackModal(false);
                setSelectedSubmission(null);
                setFeedback('');
                loadSubmissions();
            } else {
                alert('Erreur lors de la validation');
            }
        } catch (error) {
            console.error('Error validating:', error);
            alert('Erreur lors de la validation');
        } finally {
            setValidating(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'in_progress':
                return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded border border-yellow-500/30">EN COURS</span>;
            case 'late':
                return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded border border-orange-500/30">EN RETARD</span>;
            case 'completed':
                return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded border border-green-500/30">VALIDÉ</span>;
            case 'failed':
                return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded border border-red-500/30">REJETÉ</span>;
            default:
                return null;
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString('fr-FR');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-system-bg">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-system-blue/30 border-t-system-blue rounded-full animate-spin" />
                    <p className="font-rajdhani text-system-blue animate-pulse">LOADING SUBMISSIONS...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin/quests"
                    className="inline-flex items-center gap-2 text-system-blue hover:text-system-blue/80 transition-colors mb-4 font-tech text-sm"
                >
                    <ArrowLeft className="w-4 h-4" />
                    RETOUR AU DASHBOARD
                </Link>
                <h1 className="text-4xl font-black font-rajdhani text-white tracking-wider mb-1">
                    SOUMISSIONS QUÊTE
                </h1>
                {quest && (
                    <p className="font-tech text-system-blue text-sm tracking-widest uppercase">
                        {quest.title}
                    </p>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-6 py-3 rounded font-rajdhani font-bold transition-colors ${filter === 'all'
                            ? 'bg-system-blue text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    TOUTES ({submissions.length})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-6 py-3 rounded font-rajdhani font-bold transition-colors ${filter === 'pending'
                            ? 'bg-system-blue text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    EN ATTENTE
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-6 py-3 rounded font-rajdhani font-bold transition-colors ${filter === 'completed'
                            ? 'bg-system-blue text-black'
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                >
                    VALIDÉES
                </button>
            </div>

            {/* Submissions List */}
            <div className="space-y-4">
                {submissions.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="font-tech text-muted-foreground">Aucune soumission</p>
                    </div>
                ) : (
                    submissions.map((submission) => (
                        <div key={submission.id} className="system-window p-6">
                            <div className="flex items-start justify-between gap-4">
                                {/* Submission Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <h3 className="font-rajdhani font-bold text-xl text-white">
                                            {submission.profiles.display_name}
                                        </h3>
                                        {getStatusBadge(submission.status)}
                                        {submission.was_late && (
                                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded border border-orange-500/30 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" />
                                                LATE (-{quest?.penalty_percentage}%)
                                            </span>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm font-tech">
                                        <div>
                                            <span className="text-muted-foreground">Assigné:</span>
                                            <div className="text-white">{formatDate(submission.assigned_at)}</div>
                                        </div>
                                        {submission.started_at && (
                                            <div>
                                                <span className="text-muted-foreground">Démarré:</span>
                                                <div className="text-white">{formatDate(submission.started_at)}</div>
                                            </div>
                                        )}
                                        {submission.completed_at && (
                                            <div>
                                                <span className="text-muted-foreground">Complété:</span>
                                                <div className="text-white">{formatDate(submission.completed_at)}</div>
                                            </div>
                                        )}
                                        {submission.points_earned !== null && (
                                            <div>
                                                <span className="text-muted-foreground">Points gagnés:</span>
                                                <div className="text-yellow-400 font-bold">{submission.points_earned} pts</div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Submission Data */}
                                    {submission.submission_data && (
                                        <div className="bg-black/40 border border-white/10 rounded p-4">
                                            <h4 className="font-rajdhani font-bold text-sm text-white mb-2">SOUMISSION:</h4>
                                            <p className="font-tech text-xs text-white whitespace-pre-wrap">
                                                {submission.submission_data.text || 'Aucune note fournie'}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                {(submission.status === 'in_progress' || submission.status === 'late') && (
                                    <div className="flex flex-col gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedSubmission(submission);
                                                setShowFeedbackModal(true);
                                            }}
                                            className="px-4 py-2 bg-system-green hover:bg-system-green/80 text-black font-rajdhani font-bold rounded transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            APPROUVER
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedSubmission(submission);
                                                setShowFeedbackModal(true);
                                            }}
                                            className="px-4 py-2 bg-system-red hover:bg-system-red/80 text-black font-rajdhani font-bold rounded transition-colors flex items-center gap-2 text-sm"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            REJETER
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Feedback Modal */}
            {showFeedbackModal && selectedSubmission && (
                <>
                    <div
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                        onClick={() => {
                            setShowFeedbackModal(false);
                            setSelectedSubmission(null);
                            setFeedback('');
                        }}
                    />
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                        <div className="system-window max-w-2xl w-full p-6">
                            <h2 className="font-rajdhani font-bold text-2xl text-white mb-4">
                                VALIDATION QUÊTE
                            </h2>
                            <p className="font-tech text-sm text-muted-foreground mb-4">
                                Membre: {selectedSubmission.profiles.display_name}
                            </p>

                            <div className="mb-6">
                                <label className="block font-tech text-sm text-muted-foreground mb-2">
                                    FEEDBACK (Optionnel)
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={4}
                                    className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white placeholder:text-muted-foreground focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none resize-none"
                                    placeholder="Commentaires pour le membre..."
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setShowFeedbackModal(false);
                                        setSelectedSubmission(null);
                                        setFeedback('');
                                    }}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-rajdhani font-bold rounded transition-colors"
                                >
                                    ANNULER
                                </button>
                                <button
                                    onClick={() => handleValidate(false)}
                                    disabled={validating}
                                    className="flex-1 py-3 bg-system-red hover:bg-system-red/80 text-black font-rajdhani font-bold rounded transition-colors disabled:opacity-50"
                                >
                                    {validating ? 'EN COURS...' : 'REJETER'}
                                </button>
                                <button
                                    onClick={() => handleValidate(true)}
                                    disabled={validating}
                                    className="flex-1 py-3 bg-system-green hover:bg-system-green/80 text-black font-rajdhani font-bold rounded transition-colors disabled:opacity-50"
                                >
                                    {validating ? 'EN COURS...' : 'APPROUVER'}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
