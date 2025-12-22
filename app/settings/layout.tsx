'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, User, Settings as SettingsIcon } from 'lucide-react';

export default function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { label: 'HTB Integration', href: '/settings/htb', icon: Shield },
        { label: 'Profile', href: '/settings/profile', icon: User },
        { label: 'Preferences', href: '/settings/preferences', icon: SettingsIcon },
    ];

    return (
        <div className="min-h-screen bg-black p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-5xl font-bold font-rajdhani text-system-green">
                        SETTINGS
                    </h1>
                    <p className="text-white/60 font-tech text-sm">
                        Configure your system parameters
                    </p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex justify-center">
                    <div className="inline-flex gap-2 p-1 bg-white/5 border border-white/10 rounded-lg">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = pathname === tab.href;

                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={`
                    flex items-center gap-2 px-4 py-2 rounded-md font-tech text-sm transition-all
                    ${isActive
                                            ? 'bg-system-green text-black font-bold'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-3xl mx-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}
