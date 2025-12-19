'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Category {
    id: string;
    name: string;
    icon: string;
    color: string;
}

export default function CreateQuestPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        points_reward: 100,
        difficulty: 'easy' as 'easy' | 'medium' | 'hard' | 'insane',
        category_id: '',
        quest_type: 'manual' as 'manual' | 'auto',
        validation_flag: '',
        deadline: '',
        penalty_percentage: 20,
    });

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const response = await fetch('/api/quests/categories');
            const data = await response.json();
            setCategories(data.categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/quests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    category_id: formData.category_id || null,
                    validation_flag: formData.validation_flag || null,
                    deadline: formData.deadline || null,
                }),
            });

            if (response.ok) {
                router.push('/admin/quests');
            } else {
                const data = await response.json();
                alert(data.error || 'Erreur lors de la création');
            }
        } catch (error) {
            console.error('Error creating quest:', error);
            alert('Erreur lors de la création');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
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
                    CRÉER UNE QUÊTE
                </h1>
                <p className="font-tech text-system-blue text-sm tracking-widest uppercase">
                    Configuration complète
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="system-window p-8 space-y-6">
                {/* Title */}
                <div>
                    <label className="block font-tech text-sm text-muted-foreground mb-2">
                        TITRE *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white placeholder:text-muted-foreground focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none"
                        placeholder="Ex: Exploiter une API REST"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block font-tech text-sm text-muted-foreground mb-2">
                        DESCRIPTION *
                    </label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white placeholder:text-muted-foreground focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none resize-none"
                        placeholder="Décrivez les objectifs de la quête..."
                    />
                </div>

                {/* Grid: Points + Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-tech text-sm text-muted-foreground mb-2">
                            POINTS RÉCOMPENSE *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            value={formData.points_reward}
                            onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) })}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none"
                        />
                    </div>

                    <div>
                        <label className="block font-tech text-sm text-muted-foreground mb-2">
                            DIFFICULTÉ *
                        </label>
                        <select
                            required
                            value={formData.difficulty}
                            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none"
                        >
                            <option value="easy">EASY</option>
                            <option value="medium">MEDIUM</option>
                            <option value="hard">HARD</option>
                            <option value="insane">INSANE</option>
                        </select>
                    </div>
                </div>

                {/* Grid: Category + Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-tech text-sm text-muted-foreground mb-2">
                            CATÉGORIE
                        </label>
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none"
                        >
                            <option value="">Aucune catégorie</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.icon} {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block font-tech text-sm text-muted-foreground mb-2">
                            TYPE DE VALIDATION *
                        </label>
                        <select
                            required
                            value={formData.quest_type}
                            onChange={(e) => setFormData({ ...formData, quest_type: e.target.value as any })}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none"
                        >
                            <option value="manual">Manuel (Admin valide)</option>
                            <option value="auto">Auto (HTB sync)</option>
                        </select>
                    </div>
                </div>

                {/* Validation Flag (if auto) */}
                {formData.quest_type === 'auto' && (
                    <div>
                        <label className="block font-tech text-sm text-muted-foreground mb-2">
                            HTB MACHINE/CHALLENGE ID
                        </label>
                        <input
                            type="text"
                            value={formData.validation_flag}
                            onChange={(e) => setFormData({ ...formData, validation_flag: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white placeholder:text-muted-foreground focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none"
                            placeholder="Ex: 123 (Machine ID HTB)"
                        />
                        <p className="mt-2 text-xs font-tech text-muted-foreground">
                            ID de la machine ou du challenge HTB pour validation automatique
                        </p>
                    </div>
                )}

                {/* Grid: Deadline + Penalty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-tech text-sm text-muted-foreground mb-2">
                            DEADLINE (Optionnel)
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none"
                        />
                    </div>

                    <div>
                        <label className="block font-tech text-sm text-muted-foreground mb-2">
                            PÉNALITÉ SI RETARD (%)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="50"
                            value={formData.penalty_percentage}
                            onChange={(e) => setFormData({ ...formData, penalty_percentage: parseInt(e.target.value) })}
                            className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none"
                        />
                        <p className="mt-2 text-xs font-tech text-muted-foreground">
                            Réduction de points si soumis après deadline
                        </p>
                    </div>
                </div>

                {/* Submit */}
                <div className="flex gap-4 pt-4 border-t border-white/10">
                    <Link
                        href="/admin/quests"
                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-rajdhani font-bold rounded transition-colors text-center"
                    >
                        ANNULER
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 bg-system-green hover:bg-system-green/80 text-black font-rajdhani font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'CRÉATION...' : 'CRÉER LA QUÊTE'}
                    </button>
                </div>
            </form>
        </div>
    );
}
