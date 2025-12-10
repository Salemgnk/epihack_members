'use client';

import { Shield, Crown, Swords, Ghost, Cpu } from 'lucide-react';
import { SystemWindow } from './SystemWindow';
import { StatBar } from './StatBar';
import { AttributeList } from './AttributeList';
import { PlayerAttributes } from '@/lib/system-types';

interface StatusWindowProps {
    username: string;
    attributes: PlayerAttributes;
    adminMode?: boolean;
    avatarUrl?: string; // We might use a 3D model or image here
}

export function StatusWindow({ username, attributes, adminMode = false }: StatusWindowProps) {
    // Determine title color based on rank/class
    const titleColor = attributes.job_class.includes('Admin') ? 'text-[#FFD700]' : 'text-system-blue';
    const borderColor = attributes.job_class.includes('Admin') ? '#FFD700' : 'var(--system-blue)';

    return (
        <SystemWindow className="w-full max-w-4xl mx-auto p-8" borderColor={borderColor} glow>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left Column: ID Card Effect */}
                <div className="relative">
                    {/* Header Info */}
                    <div className="space-y-2 mb-8">
                        <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-widest">NAME</span>
                            <h1 className="text-4xl font-rajdhani font-bold text-white tracking-wide">
                                {username.toUpperCase()}
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-widest">LEVEL</span>
                                <div className="text-2xl font-mono text-white">
                                    {attributes.level}
                                </div>
                            </div>
                            <div>
                                <span className="text-xs text-muted-foreground uppercase tracking-widest">JOB</span>
                                <div className={`text-2xl font-rajdhani font-bold ${titleColor}`}>
                                    {attributes.job_class.toUpperCase()}
                                </div>
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-muted-foreground uppercase tracking-widest">TITLE</span>
                            <div className="text-lg font-rajdhani text-white/90 border-b border-white/10 pb-1">
                                {attributes.title}
                            </div>
                        </div>
                    </div>

                    {/* Bars */}
                    <div className="space-y-4">
                        <StatBar
                            label="HP"
                            value={100}
                            max={100}
                            color="#FF2A2A"
                        />
                        <StatBar
                            label="MP"
                            value={attributes.mana}
                            max={attributes.max_mana}
                            color="#00F0FF"
                        />
                        <StatBar
                            label="XP"
                            value={attributes.experience}
                            max={1000} // TODO: Dynamic max 
                            color="#FFD700"
                            showValue={false}
                        />
                    </div>
                </div>

                {/* Right Column: Stats */}
                <div className="relative">
                    <div className="absolute -top-4 -right-4 text-xs font-tech text-muted-foreground/30">
                        // SYSTEM.MONITORING.ACTIVE
                    </div>

                    <h3 className="text-xl font-rajdhani font-bold text-white mb-6 border-b border-white/10 pb-2">
                        ATTRIBUTES
                    </h3>

                    <AttributeList stats={attributes.attributes} adminMode={adminMode} />

                    <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-xs font-tech text-muted-foreground">
                        <span>AVAILABLE POINTS: 0</span>
                        {adminMode && (
                            <span className="text-system-red animate-pulse">
                                [ DONATE POINTS ]
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </SystemWindow>
    );
}
