'use client';

import { useState } from 'react';
import { X, Upload } from 'lucide-react';

interface QuestSubmissionModalProps {
    quest: {
        id: string;
        title: string;
        quest_type: 'manual' | 'auto';
    };
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { text: string; files?: File[] }) => Promise<void>;
}

export function QuestSubmissionModal({ quest, isOpen, onClose, onSubmit }: QuestSubmissionModalProps) {
    const [submissionText, setSubmissionText] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = async () => {
        if (!submissionText.trim() && files.length === 0) {
            alert('Veuillez fournir des informations ou des fichiers');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit({ text: submissionText, files });
            onClose();
            setSubmissionText('');
            setFiles([]);
        } catch (error) {
            console.error('Submission error:', error);
            alert('Erreur lors de la soumission');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
                <div
                    className="system-window max-w-2xl w-full p-6 animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="font-rajdhani font-bold text-2xl text-white mb-1">
                                SOUMETTRE LA QUÊTE
                            </h2>
                            <p className="font-tech text-sm text-system-blue">{quest.title}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Type Info */}
                    {quest.quest_type === 'auto' ? (
                        <div className="bg-system-blue/10 border border-system-blue/30 rounded p-4 mb-6">
                            <p className="font-tech text-sm text-system-blue">
                                ℹ️ Cette quête sera validée automatiquement lors de la prochaine synchronisation HTB.
                                Vous pouvez ajouter des notes ci-dessous.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-4 mb-6">
                            <p className="font-tech text-sm text-yellow-400">
                                ⚠️ Votre soumission sera examinée par un admin. Fournissez le maximum de détails.
                            </p>
                        </div>
                    )}

                    {/* Form */}
                    <div className="space-y-4 mb-6">
                        {/* Text Input */}
                        <div>
                            <label className="font-tech text-sm text-muted-foreground mb-2 block">
                                DESCRIPTION / NOTES
                            </label>
                            <textarea
                                value={submissionText}
                                onChange={(e) => setSubmissionText(e.target.value)}
                                placeholder="Décrivez votre solution, les étapes suivies, les flags trouvés..."
                                className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-sm text-white placeholder:text-muted-foreground focus:border-system-blue focus:ring-1 focus:ring-system-blue outline-none resize-none"
                                rows={6}
                            />
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="font-tech text-sm text-muted-foreground mb-2 block">
                                CAPTURES D'ÉCRAN / PREUVES (OPTIONNEL)
                            </label>
                            <div className="border-2 border-dashed border-white/20 rounded p-6 text-center hover:border-system-blue/50 transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                                    <p className="font-tech text-sm text-muted-foreground mb-1">
                                        Cliquez pour uploader des fichiers
                                    </p>
                                    <p className="font-tech text-xs text-muted-foreground/60">
                                        Images ou PDFs
                                    </p>
                                </label>
                            </div>

                            {/* Selected Files */}
                            {files.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    {files.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between bg-white/5 rounded p-2"
                                        >
                                            <span className="font-tech text-xs text-white truncate">
                                                {file.name}
                                            </span>
                                            <button
                                                onClick={() => setFiles(files.filter((_, i) => i !== index))}
                                                className="text-system-red hover:text-system-red/80 text-xs"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-rajdhani font-bold rounded transition-colors disabled:opacity-50"
                        >
                            ANNULER
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!submissionText.trim() && files.length === 0)}
                            className="flex-1 py-3 bg-system-green hover:bg-system-green/80 text-black font-rajdhani font-bold rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'ENVOI...' : 'SOUMETTRE'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
