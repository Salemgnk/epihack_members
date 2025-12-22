'use client';

import { useState } from 'react';
import { X, Palette } from 'lucide-react';

interface CreateCategoryModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const PRESET_COLORS = [
    '#9FEF00', // Green
    '#00F0FF', // Cyan
    '#FF0000', // Red
    '#FFD700', // Gold
    '#FF6B35', // Orange
    '#9B59B6', // Purple
    '#E91E63', // Pink
    '#00BCD4', // Teal
];

const PRESET_ICONS = ['🎯', '🔥', '💻', '🛡️', '⚡', '🚀', '💎', '🎮', '🔐', '🌐'];

export default function CreateCategoryModal({ onClose, onSuccess }: CreateCategoryModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [color, setColor] = useState(PRESET_COLORS[0]);
    const [icon, setIcon] = useState(PRESET_ICONS[0]);
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = async () => {
        if (!name) return;

        setSubmitting(true);
        try {
            const response = await fetch('/api/quests/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    color,
                    icon
                })
            });

            if (response.ok) {
                onSuccess();
                onClose();
            }
        } catch (error) {
            console.error('Error creating category:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-system-panel border border-system-green/30 rounded-sm p-6 max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-rajdhani font-bold text-system-green">
                        NOUVELLE CATÉGORIE
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="text-xs font-tech text-muted-foreground block mb-1">
                            NOM *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Web Security"
                            className="w-full px-4 py-2 bg-black border border-white/20 rounded-sm text-white font-rajdhani focus:border-system-green focus:outline-none"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-tech text-muted-foreground block mb-1">
                            DESCRIPTION
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Challenges focused on web vulnerabilities..."
                            className="w-full px-4 py-2 bg-black border border-white/20 rounded-sm text-white font-tech text-sm focus:border-system-green focus:outline-none resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Icon */}
                    <div>
                        <label className="text-xs font-tech text-muted-foreground block mb-2">
                            ICÔNE
                        </label>
                        <div className="grid grid-cols-10 gap-2">
                            {PRESET_ICONS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => setIcon(emoji)}
                                    className={`text-2xl p-2 rounded border transition-all ${icon === emoji
                                            ? 'border-system-green bg-system-green/20'
                                            : 'border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="text-xs font-tech text-muted-foreground block mb-2">
                            COULEUR
                        </label>
                        <div className="grid grid-cols-8 gap-2">
                            {PRESET_COLORS.map((presetColor) => (
                                <button
                                    key={presetColor}
                                    onClick={() => setColor(presetColor)}
                                    className={`w-10 h-10 rounded border-2 transition-all ${color === presetColor
                                            ? 'border-white scale-110'
                                            : 'border-transparent hover:scale-105'
                                        }`}
                                    style={{ backgroundColor: presetColor }}
                                />
                            ))}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <Palette className="w-4 h-4 text-muted-foreground" />
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="w-12 h-8 bg-black border border-white/20 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="flex-1 px-3 py-1 bg-black border border-white/20 rounded text-white font-mono text-sm focus:border-system-green focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-black border border-white/10 rounded-sm">
                        <div className="text-xs font-tech text-muted-foreground mb-2">APERÇU</div>
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">{icon}</div>
                            <div>
                                <div className="font-rajdhani font-bold text-lg" style={{ color }}>
                                    {name || 'Nom de la catégorie'}
                                </div>
                                <div className="text-xs text-muted-foreground font-tech">
                                    {description || 'Description...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/20 rounded-sm font-tech text-sm transition-all"
                        disabled={submitting}
                    >
                        ANNULER
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={!name || submitting}
                        className="flex-1 px-4 py-2 bg-system-green hover:bg-system-green/80 disabled:bg-white/10 disabled:text-white/40 text-black font-bold rounded-sm font-tech text-sm transition-all"
                    >
                        {submitting ? 'CRÉATION...' : 'CRÉER'}
                    </button>
                </div>
            </div>
        </div>
    );
}
