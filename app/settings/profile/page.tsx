'use client';

import { useEffect, useState } from 'react';
import { SystemCard } from '@/components/ui/SystemCard';
import { User, Mail, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

export default function ProfileSettingsPage() {
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            setUser(currentUser);

            if (currentUser) {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', currentUser.id)
                    .single();
                setProfile(data);
            }
        } catch (error) {
            console.error('Error loading profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <SystemCard title="PROFILE">
                <div className="text-center py-8 text-system-green font-tech animate-pulse">
                    LOADING...
                </div>
            </SystemCard>
        );
    }

    return (
        <div className="space-y-6">
            <SystemCard title="PROFILE" subtitle="USER INFORMATION">
                <div className="space-y-6">
                    {/* Email */}
                    <div>
                        <label className="block text-xs font-tech text-system-green mb-2 uppercase">
                            Email Address
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-sm">
                            <Mail className="w-5 h-5 text-system-blue" />
                            <span className="font-tech text-white">{user?.email}</span>
                        </div>
                    </div>

                    {/* User ID */}
                    <div>
                        <label className="block text-xs font-tech text-system-green mb-2 uppercase">
                            System ID
                        </label>
                        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-sm font-mono text-sm text-white/60">
                            {user?.id}
                        </div>
                    </div>

                    {/* HTB Status */}
                    {profile?.htb_username && (
                        <div>
                            <label className="block text-xs font-tech text-system-green mb-2 uppercase">
                                HTB Account
                            </label>
                            <div className="flex items-center gap-3 p-3 bg-system-green/10 border border-system-green/30 rounded-sm">
                                <Shield className="w-5 h-5 text-system-green" />
                                <span className="font-tech text-system-green">{profile.htb_username}</span>
                                <span className="ml-auto text-xs text-system-green/60">LINKED</span>
                            </div>
                        </div>
                    )}

                    {/* Info */}
                    <div className="p-4 bg-system-blue/10 border border-system-blue/30 rounded-sm">
                        <p className="text-xs font-tech text-system-blue">
                            ℹ️ Profile editing coming soon. Contact admin for changes.
                        </p>
                    </div>
                </div>
            </SystemCard>
        </div>
    );
}
