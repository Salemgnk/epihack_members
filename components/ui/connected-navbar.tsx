"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Shield, 
  LayoutDashboard, 
  Trophy, 
  Award,
  Target,
  User as UserIcon,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  is_admin: boolean;
  is_member: boolean;
  total_points: number;
}

export default function ConnectedNavbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        // Get current user
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          setUser(currentUser);
          
          // Fetch profile
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const navLinks = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'CTF', href: '/ctf', icon: Trophy },
    { label: 'Easter Eggs', href: '/easter-eggs-ctf', icon: Target },
  { label: 'Scoreboard', href: '/scoreboard', icon: Award },
  ];

  const accountMenuItems = [
    { label: 'Mon Profil', href: '/profile', icon: UserIcon },
    { label: 'Paramètres', href: '/administration/settings', icon: Settings },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.account-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isDropdownOpen]);

  if (loading) {
    return (
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center animate-pulse">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-bold tracking-wide">EPIHACK</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-5 h-5 text-black" />
            </div>
            <span className="text-white font-bold tracking-wide group-hover:text-green-400 transition-colors">
              EPIHACK
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-green-500 text-black shadow-lg shadow-green-500/30' 
                    : 'text-gray-300 hover:text-green-400 hover:bg-gray-800/50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Account Menu */}
        <div className="relative account-dropdown">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 border border-gray-700 hover:border-green-400/50"
          >
            {/* Avatar */}
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={profile.username}
                className="w-8 h-8 rounded-full object-cover border-2 border-green-400"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-400 flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-black" />
              </div>
            )}

            {/* Username + Badge */}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-white">
                {profile?.username || 'User'}
              </span>
              {profile?.is_admin && (
                <span className="text-xs text-green-400 font-bold uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>

            <ChevronDown 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} 
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-2xl shadow-black/50 overflow-hidden animate-fadeIn">
              {/* User Info Header */}
              <div className="px-4 py-3 bg-gradient-to-r from-green-500/10 to-green-400/10 border-b border-gray-800">
                <p className="text-sm font-medium text-white">{profile?.username}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
                <div className="mt-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-green-400 font-bold">
                    {profile?.total_points || 0} points
                  </span>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {accountMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  );
                })}

                {/* Admin Link */}
                {profile?.is_admin && (
                  <>
                    <div className="my-2 border-t border-gray-800" />
                    <Link
                      href="/administration"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 text-sm text-green-400 hover:bg-green-500/10 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span className="font-bold">Admin Panel</span>
                    </Link>
                  </>
                )}

                {/* Logout */}
                <div className="my-2 border-t border-gray-800" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Mobile Navigation (Bottom Nav for Mobile) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 z-50">
        <nav className="flex items-center justify-around px-6 py-3">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200
                  ${isActive 
                    ? 'text-green-400' 
                    : 'text-gray-400'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </header>
  );
}
