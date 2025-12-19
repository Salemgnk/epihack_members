"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { supabase } from '@/lib/supabase-client';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const navLinks = [
    { label: 'Actualités', href: '/actualites' },
    { label: 'Projets', href: '/projets' },
    { label: 'Notre Histoire', href: '/notre-histoire' },
    { label: 'Galerie', href: '/galerie' },
  ];

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setLoading(false);
    }

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const closeMenu = () => setOpen(false);

  // If user is authenticated and not on landing page, show connected version
  // TODO: Implement ConnectedNavbar with NotificationBell
  if (isAuthenticated && pathname !== '/') {
    return null; // Temporarily disabled until ConnectedNavbar is implemented
  }

  // Show loading state while checking auth
  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center animate-pulse border border-primary/50">
              <div className="relative w-full h-full">
                <Image src="/assets/logo.png" alt="Logo" fill className="object-contain p-1" />
              </div>
            </div>
            <span className="text-primary font-black text-xl tracking-tight">EPIHACK</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 transition-transform group-hover:scale-110">
            <Image
              src="/assets/logo.png"
              alt="EpiHack Logo"
              fill
              className="object-contain drop-shadow-[0_0_10px_rgba(0,255,0,0.3)]"
            />
          </div>
          <span className="text-primary font-black text-xl tracking-tight group-hover:text-primary/80 transition-colors">
            EPIHACK
          </span>
        </Link>

        {/* Desktop Navigation - SANS boutons auth */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu - SANS boutons auth */}
      {open && (
        <div className="md:hidden bg-black/95 backdrop-blur-md border-b border-primary/20">
          <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors py-2"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
