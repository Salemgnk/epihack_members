'use client';

import { Plus, Minus } from 'lucide-react';
import { PlayerStats } from '@/lib/system-types';

interface AttributeRowProps {
    label: string;
    value: number;
    description?: string;
    adminMode?: boolean;
    onIncrease?: () => void;
    onDecrease?: () => void;
}

function AttributeRow({ label, value, description, adminMode, onIncrease, onDecrease }: AttributeRowProps) {
    return (
        <div className="flex items-center justify-between py-2 group hover:bg-white/5 px-2 rounded transition-colors">
            <div className="flex items-center gap-4">
                <span className="text-lg font-rajdhani font-bold text-muted-foreground w-16">
                    {label}
                </span>
                <span className="text-2xl font-mono text-white font-bold group-hover:text-system-blue transition-colors">
                    {value}
                </span>
            </div>

            {adminMode ? (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={onDecrease}
                        className="p-1 hover:bg-system-red/20 rounded text-system-red"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onIncrease}
                        className="p-1 hover:bg-system-green/20 rounded text-system-green"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <span className="text-xs text-muted-foreground/50 font-tech">
                    {description}
                </span>
            )}
        </div>
    );
}

interface AttributeListProps {
    stats: PlayerStats;
    adminMode?: boolean;
}

export function AttributeList({ stats, adminMode = false }: AttributeListProps) {
    return (
        <div className="space-y-1">
            <AttributeRow
                label="STR"
                value={stats.STR || 0}
                description="Power (HTB)"
                adminMode={adminMode}
            />
            <AttributeRow
                label="VIT"
                value={stats.VIT || 0}
                description="Endurance (Activity)"
                adminMode={adminMode}
            />
            <AttributeRow
                label="AGI"
                value={stats.AGI || 0}
                description="Speed (Solves)"
                adminMode={adminMode}
            />
            <AttributeRow
                label="INT"
                value={stats.INT || 0}
                description="Knowledge (CTF)"
                adminMode={adminMode}
            />
            <AttributeRow
                label="SENSE"
                value={stats.SENSE || 0}
                description="Intuition (Luck)"
                adminMode={adminMode}
            />
        </div>
    );
}
