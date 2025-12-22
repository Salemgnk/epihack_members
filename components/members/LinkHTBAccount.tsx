'use client';

import { useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { Loader2, Link as LinkIcon, ExternalLink, ShieldAlert, Terminal, CheckCircle2 } from 'lucide-react';
import { SystemCard } from '@/components/ui/SystemCard';

export default function LinkHTBAccount() {
    const [identifier, setIdentifier] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleLinkAccount = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!identifier.trim()) {
            showToast('PLEASE ENTER HTB USER ID OR USERNAME', 'error');
            return;
        }

        setLoading(true);

        try {
            // Call API route to validate and link HTB account
            const response = await fetch('/api/htb/link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: identifier.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'LINKING FAILED');
            }

            showToast('OPERATOR IDENTITY VERIFIED', 'success');
            setIdentifier('');

            // Refresh page to show linked account
            window.location.reload();
        } catch (error: any) {
            console.error('Error linking HTB account:', error);
            showToast(error.message || 'LINKING PROTOCOL ERROR', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SystemCard title="IDENTITY LINKING PROTOCOL" subtitle="EXTERNAL SYSTEM CONNECTION" glowing className="border-system-green/30">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Instructions */}
                <div className="md:w-1/2 space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded bg-system-green/10 flex items-center justify-center border border-system-green/30 shrink-0">
                            <Terminal className="w-5 h-5 text-system-green" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold font-rajdhani text-white">ESTABLISH CONNECTION</h3>
                            <p className="text-sm font-tech text-muted-foreground mt-1">
                                Synchronize HackTheBox operator data with local system database.
                            </p>
                        </div>
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded p-4 font-tech text-xs space-y-2">
                        <div className="flex items-center gap-2 text-system-blue">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>SYNC MODULE ACTIVATED</span>
                        </div>
                        <ul className="text-muted-foreground space-y-1 pl-5 list-disc">
                            <li>Unlock "HTB Connected" Badge [+50 PTS]</li>
                            <li>Enable automated stats synchronization</li>
                            <li>Access classified PVP operations (Duels)</li>
                            <li>Operator comparison analysis available</li>
                        </ul>
                    </div>
                </div>

                {/* Form */}
                <div className="md:w-1/2 bg-black/50 border border-white/5 rounded p-6 relative overflow-hidden group">
                    {/* Scanning Effect */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-system-green/30 animate-scanline opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <form onSubmit={handleLinkAccount} className="space-y-6 relative z-10">
                        <div>
                            <label htmlFor="htb-identifier" className="block text-xs font-bold font-rajdhani text-system-green mb-2 uppercase tracking-wider">
                                HackTheBox User ID or Username
                            </label>
                            <div className="relative">
                                <input
                                    id="htb-identifier"
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="Enter User ID (e.g., 123456) OR username (e.g., Scorpi777)"
                                    className="w-full pl-4 pr-4 py-3 bg-black border border-white/20 rounded-sm focus:outline-none focus:border-system-green focus:ring-1 focus:ring-system-green font-tech text-white tracking-wider placeholder-white/20 transition-all"
                                    disabled={loading}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-system-green animate-pulse" />
                            </div>
                            <p className="text-[10px] font-tech text-muted-foreground mt-2 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" />
                                User ID recommended (from profile URL). Username works too.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !identifier.trim()}
                            className="w-full py-3 bg-system-green hover:bg-system-green/90 text-black font-bold font-rajdhani rounded-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider shadow-[0_0_15px_rgba(0,255,157,0.3)] hover:shadow-[0_0_25px_rgba(0,255,157,0.5)]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    VERIFYING IDENTITY...
                                </>
                            ) : (
                                <>
                                    <LinkIcon className="w-5 h-5" />
                                    INITIATE LINK
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-4 border-t border-white/5 text-center">
                        <a
                            href="https://app.hackthebox.com/register"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] font-tech text-muted-foreground hover:text-system-blue transition-colors inline-flex items-center gap-1 uppercase"
                        >
                            Create New Agent Profile
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </SystemCard>
    );
}
