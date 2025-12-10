import { Metadata } from 'next';
import LinkHTBAccount from '@/components/members/LinkHTBAccount';
import { Settings, Shield, Lock } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Paramètres HTB | EpiHack Members',
    description: 'Liez votre compte HackTheBox pour synchroniser vos stats',
};

export default function HTBSettingsPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8 flex items-end justify-between border-b border-white/5 pb-4">
                <div>
                    <h1 className="text-4xl font-black font-rajdhani text-white tracking-wider mb-2 animate-glitch">
                        SYSTEM CONFIGURATION
                    </h1>
                    <p className="font-tech text-system-blue text-sm tracking-widest uppercase">
                        External Integrations & Security
                    </p>
                </div>
                <div className="hidden md:flex items-center gap-2 text-system-blue opacity-50">
                    <Settings className="w-6 h-6 animate-spin-slow" />
                </div>
            </div>

            <div className="grid gap-8">
                <LinkHTBAccount />

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white/5 border border-white/10 rounded p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Shield className="w-32 h-32" />
                        </div>
                        <h3 className="font-bold font-rajdhani text-xl text-white mb-4 flex items-center gap-2">
                            <span className="text-system-blue">ℹ️</span> SYSTEM PROTOCOLS
                        </h3>
                        <ol className="font-tech text-sm text-muted-foreground space-y-3 list-decimal list-inside relative z-10">
                            <li><span className="text-white">Profile Verification:</span> Operator inputs HTB identity.</li>
                            <li><span className="text-white">Database Query:</span> System validates existence of target profile.</li>
                            <li><span className="text-white">Daily Sync:</span> Cron jobs update stats every 24 hours.</li>
                            <li><span className="text-white">Reward Distribution:</span> Points allocated based on confirmed pwns.</li>
                            <li><span className="text-white">Combat Access:</span> PVP modules unlocked upon verification.</li>
                        </ol>
                    </div>

                    <div className="bg-system-red/5 border border-system-red/20 rounded p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Lock className="w-32 h-32" />
                        </div>
                        <h3 className="font-bold font-rajdhani text-xl text-system-red mb-4 flex items-center gap-2">
                            <span className="text-system-red">🔒</span> SECURITY CLEARANCE
                        </h3>
                        <div className="font-tech text-sm text-muted-foreground space-y-4 relative z-10">
                            <p>
                                <strong className="text-white">DATA PRIVACY:</strong> Only public intelligence from your HTB profile is accessed. Authentication tokens and passwords remain encrypted and are never stored in plain text.
                            </p>
                            <p>
                                You retain the authority to revoke system access and unlink your account at any time via this terminal.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
