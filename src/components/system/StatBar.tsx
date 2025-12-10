'use client';

interface StatBarProps {
    value: number;
    max: number;
    color?: string;
    label?: string;
    showValue?: boolean;
}

export function StatBar({
    value,
    max,
    color = "var(--system-blue)",
    label,
    showValue = true
}: StatBarProps) {
    const percentage = Math.min(100, (value / max) * 100);

    return (
        <div className="w-full">
            {(label || showValue) && (
                <div className="flex justify-between items-end mb-1">
                    {label && (
                        <span className="text-xs font-rajdhani font-semibold text-muted-foreground uppercase tracking-widest">
                            {label}
                        </span>
                    )}
                    {showValue && (
                        <span className="text-xs font-mono text-white">
                            {value}/{max}
                        </span>
                    )}
                </div>
            )}

            <div className="h-2 bg-black/50 border border-white/10 relative overflow-hidden skew-x-[-10deg]">
                {/* Background Grid */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.1) 50%)`,
                        backgroundSize: '4px 100%'
                    }}
                />

                {/* Fill Bar */}
                <div
                    className="h-full transition-all duration-1000 ease-out relative"
                    style={{
                        width: `${percentage}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}`
                    }}
                >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
            </div>
        </div>
    );
}
