import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/ui/sidebar";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "EPIHACK Members",
  description: "EPIHACK Members Dashboard - CTF Arena & Leaderboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <ToastProvider>
          <div className="min-h-screen bg-system-bg relative overflow-x-hidden font-sans text-foreground">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none z-0" />
            <div className="fixed inset-0 bg-dot opacity-10 pointer-events-none z-0 animate-pulse-slow" />

            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="relative z-10 transition-[padding] duration-200 md:pl-[var(--sidebar-width,4rem)]">
              {children}
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
