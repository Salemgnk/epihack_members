'use client';

import { SystemCard } from '@/components/ui/SystemCard';
import { Bell, Monitor } from 'lucide-react';

export default function PreferencesPage() {
    return (
        <div className="space-y-6">
            <SystemCard title="PREFERENCES" subtitle="DISPLAY & NOTIFICATIONS">
                <div className="space-y-6">
                    {/* Notifications */}
                    <div>
                        <h3 className="font-rajdhani font-bold text-white mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-system-green" />
                            Notifications
                        </h3>
                        <div className="space-y-3">
                            <PreferenceToggle
                                label="Quest Assignments"
                                description="Get notified when a new quest is assigned"
                                defaultChecked={true}
                            />
                            <PreferenceToggle
                                label="Points Earned"
                                description="Notification when you earn points"
                                defaultChecked={true}
                            />
                            <PreferenceToggle
                                label="Rank Changes"
                                description="Alert when your rank changes"
                                defaultChecked={true}
                            />
                        </div>
                    </div>

                    {/* Display */}
                    <div>
                        <h3 className="font-rajdhani font-bold text-white mb-4 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-system-blue" />
                            Display
                        </h3>
                        <div className="space-y-3">
                            <PreferenceToggle
                                label="Dark Mode"
                                description="Always enabled (system theme)"
                                defaultChecked={true}
                                disabled={true}
                            />
                            <PreferenceToggle
                                label="Reduced Motion"
                                description="Disable animations"
                                defaultChecked={false}
                            />
                        </div>
                    </div>

                    {/* Info */}
                    <div className="p-4 bg-system-blue/10 border border-system-blue/30 rounded-sm">
                        <p className="text-xs font-tech text-system-blue">
                            ℹ️ Preferences are saved automatically
                        </p>
                    </div>
                </div>
            </SystemCard>
        </div>
    );
}

function PreferenceToggle({
    label,
    description,
    defaultChecked = false,
    disabled = false
}: {
    label: string;
    description: string;
    defaultChecked?: boolean;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-start justify-between p-3 bg-white/5 border border-white/10 rounded-sm">
            <div className="flex-1">
                <div className="font-rajdhani font-bold text-white text-sm">{label}</div>
                <div className="text-xs text-muted-foreground font-tech">{description}</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input
                    type="checkbox"
                    defaultChecked={defaultChecked}
                    disabled={disabled}
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-system-green"></div>
            </label>
        </div>
    );
}
