'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        setAuthenticated(true);
        router.push('/dashboard');
      } else {
        setAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-system-bg">
        <div className="text-system-green animate-pulse font-rajdhani text-xl">
          Loading...
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-system-bg relative overflow-hidden">
        {/* Ambient Background Effects */}
        <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none z-0" />
        <div className="fixed inset-0 bg-dot opacity-10 pointer-events-none z-0 animate-pulse-slow" />

        <div className="relative z-10 text-center max-w-2xl px-4">
          <div className="system-window p-12 rounded-lg">
            <h1 className="text-5xl font-rajdhani font-bold text-system-green mb-4 tracking-wider">
              EPIHACK
            </h1>
            <h2 className="text-2xl font-rajdhani font-semibold text-system-blue mb-6">
              MEMBERS ONLY
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-system-green to-transparent mb-8"></div>
            <p className="text-muted-foreground font-tech text-sm mb-8">
              ACCESS RESTRICTED • AUTHENTICATION REQUIRED
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="w-2 h-2 bg-system-red rounded-full animate-pulse"></span>
              <span className="font-tech">UNAUTHORIZED</span>
            </div>
          </div>
          <p className="mt-8 text-xs text-muted-foreground font-tech">
            // If you know, you know
          </p>
        </div>
      </div>
    );
  }

  return null;
}
