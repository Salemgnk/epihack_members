'use client';

import { useEffect, useState } from 'react';
import { X, Users as UsersIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

interface Member {
    id: string;
    email: string;
    htb_username: string | null;
}

interface AssignQuestModalProps {
    questId: string;
    questTitle: string;
    onClose: () => void;
    onSuccess: () => void;
}

export default function AssignQuestModal({ questId, questTitle, onClose, onSuccess }: AssignQuestModalProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadMembers();
    }, []);

    const loadMembers = async () => {
        try {
            // Get all profiles
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, htb_username')
                .order('created_at', { ascending: false });

            // Note: Without SERVICE_ROLE_KEY, we can't get emails
            // So we'll show ID placeholders
            const membersData = profiles?.map((p: any, index: number) => ({
                id: p.id,
                email: `Member #${index + 1}`,
                htb_username: p.htb_username
            })) || [];

            setMembers(membersData);
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMember = (memberId: string) => {
        const newSelected = new Set(selectedMembers);
        if (newSelected.has(memberId)) {
            newSelected.delete(memberId);
        } else {
            newSelected.add(memberId);
        }
        setSelectedMembers(newSelected);
    };

    const handleAssign = async () => {
        if (selectedMembers.size === 0) return;

        setSubmitting(true);
        try {
            const response = await fetch(`/api/quests/${questId}/assign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    memberIds: Array.from(selectedMembers)
                })
            });

            if (response.ok) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error assigning quest:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-system-panel border border-system-blue/30 rounded-sm p-6 max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-2xl font-rajdhani font-bold text-system-blue">
                            ASSIGNER QUÊTE
                        </h3>
                        <p className="text-sm font-tech text-muted-foreground mt-1">
                            {questTitle}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Members List */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-4">
                    {loading ? (
                        <div className="text-center py-8 text-system-green font-tech animate-pulse">
                            CHARGEMENT...
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground font-tech">
                            Aucun membre trouvé
                        </div>
                    ) : (
                        members.map((member) => (
                            <label
                                key={member.id}
                                className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all ${selectedMembers.has(member.id)
                                    ? 'bg-system-blue/20 border-system-blue'
                                    : 'bg-white/5 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedMembers.has(member.id)}
                                    onChange={() => toggleMember(member.id)}
                                    className="w-5 h-5 rounded border-white/20 bg-black checked:bg-system-blue checked:border-system-blue focus:ring-system-blue focus:ring-offset-0"
                                />
                                <div className="flex-1">
                                    <div className="font-tech text-white text-sm">
                                        {member.email}
                                    </div>
                                    {member.htb_username && (
                                        <div className="text-xs text-system-green mt-0.5">
                                            HTB: {member.htb_username}
                                        </div>
                                    )}
                                </div>
                            </label>
                        ))
                    )}
                </div>

                {/* Selected Count */}
                <div className="mb-4 px-3 py-2 bg-white/5 rounded-sm border border-white/10">
                    <div className="text-xs font-tech text-muted-foreground">
                        SÉLECTIONNÉS
                    </div>
                    <div className="text-lg font-rajdhani font-bold text-system-blue">
                        <UsersIcon className="w-4 h-4 inline mr-2" />
                        {selectedMembers.size} membre{selectedMembers.size !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-sm font-tech text-sm transition-all"
                        disabled={submitting}
                    >
                        ANNULER
                    </button>
                    <button
                        onClick={handleAssign}
                        disabled={selectedMembers.size === 0 || submitting}
                        className="flex-1 px-4 py-2 bg-system-blue hover:bg-system-blue/80 disabled:bg-white/10 disabled:text-white/40 text-black font-bold rounded-sm font-tech text-sm transition-all"
                    >
                        {submitting ? 'ASSIGNATION...' : `ASSIGNER (${selectedMembers.size})`}
                    </button>
                </div>
            </div>
        </div>
    );
}
