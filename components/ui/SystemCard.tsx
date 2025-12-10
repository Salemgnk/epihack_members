import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SystemCardProps {
    children: ReactNode;
    className?: string;
    title?: string;
    subtitle?: string;
    delay?: number; // Animation delay index
    glowing?: boolean;
}

export function SystemCard({
    children,
    className,
    title,
    subtitle,
    delay = 0,
    glowing = false
}: SystemCardProps) {
    return (
        <div
            className={cn(
                "system-window p-6 relative overflow-hidden group hover:border-system-blue/60 transition-colors animate-fade-in-up",
                glowing && "shadow-[0_0_15px_rgba(0,240,255,0.2)]",
                className
            )}
            style={{ animationDelay: `${delay * 0.1}s` }}
        >
            {/* Decorative corner markers */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-system-blue/50" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-system-blue/50" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-system-blue/50" />

            {/* Scanline effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-system-blue/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none" />

            {(title || subtitle) && (
                <div className="mb-6 border-b border-white/5 pb-2 flex justify-between items-end">
                    <div>
                        {title && (
                            <h3 className="font-rajdhani font-bold text-xl text-white tracking-wide uppercase">
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p className="font-tech text-system-blue text-xs tracking-wider">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {/* Decorative lines */}
                    <div className="flex gap-1">
                        <div className="w-8 h-1 bg-system-blue/20" />
                        <div className="w-2 h-1 bg-system-blue/40" />
                        <div className="w-1 h-1 bg-system-blue" />
                    </div>
                </div>
            )}

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
