'use client';

import { ReactNode } from 'react';

interface SystemWindowProps {
    children: ReactNode;
    title?: string;
    className?: string;
    borderColor?: string;
    glow?: boolean;
}

export function SystemWindow({
    children,
    title,
    className = "",
    borderColor = "var(--system-blue)",
    glow = false
}: SystemWindowProps) {
    return (
        <div
            className={`relative bg-[rgba(5,5,20,0.9)] backdrop-blur-xl border border-white/10 ${className}`}
            style={{
                boxShadow: glow ? `0 0 20px ${borderColor}40` : 'none',
                borderColor: `${borderColor}60`
            }}
        >
            {/* Top Border Line */}
            <div
                className="absolute top-0 left-0 w-full h-[1px]"
                style={{ background: `linear-gradient(90deg, transparent, ${borderColor}, transparent)` }}
            />

            {/* Corner Decoration */}
            <div
                className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2"
                style={{ borderColor: borderColor }}
            />

            {/* Header */}
            {title && (
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-4" style={{ backgroundColor: borderColor }} />
                    <h2 className="text-xl font-rajdhani font-bold text-white tracking-wider">
                        {title.toUpperCase()}
                    </h2>
                </div>
            )}

            {children}
        </div>
    );
}
