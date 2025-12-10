"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldAlert, Info, Terminal } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'error':
        return <ShieldAlert className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Terminal className="w-5 h-5" />;
    }
  };

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-system-green shadow-[0_0_15px_rgba(0,255,157,0.3)] text-system-green';
      case 'error':
        return 'border-system-red shadow-[0_0_15px_rgba(255,42,42,0.3)] text-system-red';
      case 'warning':
        return 'border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)] text-yellow-500';
      default:
        return 'border-system-blue shadow-[0_0_15px_rgba(0,240,255,0.3)] text-system-blue';
    }
  };

  const getTitle = (type: ToastType) => {
    switch (type) {
      case 'success': return 'OPERATION SUCCESS';
      case 'error': return 'SYSTEM ERROR';
      case 'warning': return 'WARNING ALERT';
      default: return 'SYSTEM NOTICE';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              relative overflow-hidden
              bg-black/90 backdrop-blur-md
              border-l-4 border-y border-r
              ${getStyles(toast.type)}
              p-0
              pointer-events-auto
              min-w-[320px] max-w-md
              animate-slide-in-right
              group
            `}
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 20px)' }} // Optional sci-fi shape
          >
            {/* Scanline */}
            <div className="absolute top-0 left-0 w-full h-full bg-repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 3px) opacity-50 pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-1 bg-white/20 animate-scanline opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-start gap-3 p-4 relative z-10">
              <div className="mt-1 animate-pulse">
                {getIcon(toast.type)}
              </div>

              <div className="flex-1">
                <h4 className="font-rajdhani font-bold text-sm tracking-wider uppercase mb-1 opacity-90">
                  {getTitle(toast.type)}
                </h4>
                <p className="font-tech text-xs text-white uppercase tracking-wide leading-relaxed">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Progress Bar (Visual only, simple animation) */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-current opacity-50 w-full animate-shrink-width origin-left" style={{ animationDuration: '5s', animationTimingFunction: 'linear' }} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
