'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Swords, X } from 'lucide-react';

interface Member {
    id: string;
    full_name: string;
    avatar_url: string;
}

interface CreateDuelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateDuelModal({ isOpen, onClose, onSuccess }: CreateDuelModalProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMember, setSelectedMember] = useState('');
    const [machineName, setMachineName] = useState('');
    const [machineId, setMachineId] = useState('');
    const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Insane'>('Medium');
    const [duration, setDuration] = useState(48);
    const [stake, setStake] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadMembers();
        }
    }, [isOpen]);

    const loadMembers = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get all members except current user
            const { data } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .neq('id', user.id)
                .order('full_name');

            setMembers(data || []);
        } catch (err) {
            console.error('Load members error:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!selectedMember || !machineName || !machineId) {
            setError('Tous les champs sont requis');
            return;
        }

        if (stake < 0 || stake > 100) {
            setError('La mise doit être entre 0 et 100 points');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/duels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    challengedId: selectedMember,
                    htbMachineId: parseInt(machineId),
                    htbMachineName: machineName,
                    difficulty,
                    durationHours: duration,
                    stake,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                onSuccess();
                onClose();
                resetForm();
            } else {
                setError(data.error || 'Erreur lors de la création du duel');
            }
        } catch (err) {
            console.error('Create duel error:', err);
            setError('Erreur lors de la création du duel');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedMember('');
        setMachineName('');
        setMachineId('');
        setDifficulty('Medium');
        setDuration(48);
        setStake(0);
        setError('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Swords className="w-6 h-6 text-primary" />
                        Créer un Duel
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-md transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Select Opponent */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Adversaire
                        </label>
                        <select
                            value={selectedMember}
                            onChange={(e) => setSelectedMember(e.target.value)}
                            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        >
                            <option value="">Sélectionner un membre</option>
                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.full_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Machine Info */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Nom de la machine HTB
                            </label>
                            <input
                                type="text"
                                value={machineName}
                                onChange={(e) => setMachineName(e.target.value)}
                                placeholder="ex: Keeper"
                                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                ID Machine HTB
                            </label>
                            <input
                                type="number"
                                value={machineId}
                                onChange={(e) => setMachineId(e.target.value)}
                                placeholder="ex: 537"
                                className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Difficulté
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {(['Easy', 'Medium', 'Hard', 'Insane'] as const).map((diff) => (
                                <button
                                    key={diff}
                                    type="button"
                                    onClick={() => setDifficulty(diff)}
                                    className={`px-4 py-2 rounded-md font-medium transition-colors ${difficulty === diff
                                            ? 'bg-primary text-black'
                                            : 'bg-card border border-border hover:bg-muted'
                                        }`}
                                >
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Durée (heures)
                        </label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            min="1"
                            max="168"
                            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Entre 1h et 168h (7 jours)
                        </p>
                    </div>

                    {/* Stake */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Mise (points)
                        </label>
                        <input
                            type="number"
                            value={stake}
                            onChange={(e) => setStake(parseInt(e.target.value))}
                            min="0"
                            max="100"
                            className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Maximum 100 points. L&apos;adversaire devra miser le même montant.
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-md p-3 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 bg-card hover:bg-muted border border-border rounded-md font-medium transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Création...' : 'Créer le Duel'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
