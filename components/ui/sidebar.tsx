"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PanelsLeftRight, ChevronLeft, Trophy, Swords, Terminal, Scroll, Settings } from "lucide-react";
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  // Load persisted state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-expanded");
      if (saved !== null) setExpanded(saved === "1");
    } catch { }
  }, []);

  // Check admin status
  useEffect(() => {
    async function checkAdmin() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAdmin(user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL);
    }
    checkAdmin();
  }, []);

  // Persist state and update layout push width
  useEffect(() => {
    const width = expanded ? "14rem" : "4rem"; // w-56 vs w-16
    document.documentElement.style.setProperty("--sidebar-width", width);
    try {
      localStorage.setItem("sidebar-expanded", expanded ? "1" : "0");
    } catch { }
  }, [expanded]);

  const pageLinks = [
    { label: "Dashboard", href: "/", icon: PanelsLeftRight },
    { label: "Quests", href: "/quests", icon: Scroll },
    { label: "Rankings", href: "/leaderboard", icon: Trophy },
    { label: "Arena", href: "/duels", icon: Swords },
    { label: "Access", href: "/settings/htb", icon: Terminal },
  ];

  // Add admin link if admin
  if (isAdmin) {
    pageLinks.push({ label: "Admin", href: "/admin/quests", icon: Settings });
  }

  return (
    <aside
      aria-label="Navigation latérale"
      className="hidden md:flex fixed left-0 top-16 bottom-0 z-40"
    >
      <div className={`group h-full rounded-none border-r border-system-blue/30 bg-system-panel backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.1)] overflow-hidden motion-safe:transition-[width] motion-safe:duration-200 motion-reduce:transition-none ${expanded ? "w-64" : "w-16"}`}>
        {/* Header */}
        <div className="flex items-center justify-between px-2 py-3 border-b border-system-blue/20">
          <div className="flex items-center gap-2 px-1 w-full justify-center">
            {!expanded ? (
              <button
                onClick={() => setExpanded(true)}
                aria-label="Expand System Menu"
                className="p-2 rounded-md border border-system-blue/30 text-system-blue hover:text-system-bg hover:bg-system-blue hover:shadow-[0_0_10px_rgba(0,240,255,0.5)] transition-all duration-300"
                title="System Menu"
              >
                <PanelsLeftRight className="w-5 h-5" />
              </button>
            ) : (
              <div className="flex items-center justify-between w-full px-2">
                <span className="font-rajdhani font-bold text-lg text-system-blue tracking-widest animate-pulse-slow">
                  SYSTEM MENU
                </span>
                <button
                  onClick={() => setExpanded(false)}
                  aria-label="Collapse System Menu"
                  className="p-1 rounded-md text-muted-foreground hover:text-system-blue transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="py-4 overflow-y-auto h-[calc(100%-56px)] flex flex-col gap-1 px-2">
          {pageLinks.map((l) => {
            const Icon = l.icon;
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-sm transition-all duration-300 group/link ${isActive
                  ? "bg-system-blue/10 border-l-2 border-system-blue text-system-blue"
                  : "text-muted-foreground hover:text-white hover:bg-white/5 border-l-2 border-transparent hover:border-white/20"
                  }`}
                title={!expanded ? l.label : undefined}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]' : 'group-hover/link:scale-110'}`} />
                {expanded && (
                  <span className="font-rajdhani font-medium tracking-wide truncate uppercase">
                    {l.label}
                  </span>
                )}
                {/* Active indicator dot for collapsed view */}
                {!expanded && isActive && (
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-system-blue shadow-[0_0_5px_#00F0FF]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* System Footer Decor */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-system-blue/50 to-transparent opacity-50" />
      </div>
    </aside>
  );
}
