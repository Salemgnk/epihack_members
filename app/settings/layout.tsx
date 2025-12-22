'use client';

import { SystemCard } from '@/components/ui/SystemCard';
import Link from 'next/link';
import { Shield, User, Settings as SettingsIcon, Bell } from 'lucide-react';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold font-rajdhani text-system-green mb-2">
                        SETTINGS
                    </h1>
                    <p className="text-white/60 font-tech text-sm">
                        Configure your system parameters
                    </p>
                </div>

                <div className="grid md:grid-cols-4 gap-6">
                    {/* Sidebar Navigation */}
                    <aside className="md:col-span-1">
                        <SystemCard title="SECTIONS">
                            <nav className="space-y-2">
                                <SettingsNavLink
                                    href="/settings/htb"
                                    icon={Shield}
                                    label="HTB Integration"
                                    description="Link HackTheBox"
                                />
                                <SettingsNavLink
                                    href="/settings/profile"
                                    icon={User}
                                    label="Profile"
                                    description="Personal info"
                                />
                                <SettingsNavLink
                                    href="/settings/preferences"
                                    icon={SettingsIcon}
                                    label="Preferences"
                                    description="Display & notifications"
                                />
                            </nav>
                        </SystemCard>
                    </aside>

                    {/* Main Content */}
                    <main className="md:col-span-3">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}

function SettingsNavLink({
    href,
    icon: Icon,
    label,
    description
}: {
    href: string;
    icon: any;
    label: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="flex items-start gap-3 p-3 rounded-sm border border-white/10 hover:border-system-green/50 bg-white/5 hover:bg-system-green/10 transition-all group"
        >
            <Icon className="w-5 h-5 text-system-green mt-0.5" />
            <div className="flex-1 min-w-0">
                <div className="font-rajdhani font-bold text-white group-hover:text-system-green transition-colors">
                    {label}
                </div>
                <div className="text-xs text-muted-foreground font-tech">
                    {description}
                </div>
            </div>
        </Link>
    );
}
