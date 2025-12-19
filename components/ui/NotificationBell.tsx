'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { Notification } from '@/lib/services/notification-service';

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(() => {
            loadNotifications();
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try {
            const response = await fetch('/api/notifications?limit=10');
            const data = await response.json();

            if (data.notifications) {
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (notificationId: string) => {
        try {
            await fetch(`/api/notifications/${notificationId}`, {
                method: 'PATCH',
            });

            // Reload notifications
            loadNotifications();
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications?mark_all_read=true', {
                method: 'PATCH',
            });

            loadNotifications();
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'DUEL_CHALLENGE':
                return '⚔️';
            case 'DUEL_ACCEPTED':
                return '✅';
            case 'DUEL_WON':
                return '🏆';
            case 'DUEL_LOST':
                return '💔';
            case 'QUEST_ASSIGNED':
                return '📝';
            case 'QUEST_VALIDATED':
                return '🎉';
            case 'HTB_ACHIEVEMENT':
                return '🎯';
            default:
                return '🔔';
        }
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'À l\'instant';
        if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)} min`;
        if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
        return `Il y a ${Math.floor(seconds / 86400)}j`;
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
                <Bell className="w-5 h-5 text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-system-red text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Notifications Panel */}
                    <div className="absolute right-0 mt-2 w-96 max-h-[32rem] overflow-hidden bg-black border border-system-blue/30 rounded-lg shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-system-blue/20 to-transparent border-b border-white/10 p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-rajdhani font-bold text-white text-lg">NOTIFICATIONS</h3>
                                <p className="font-tech text-xs text-muted-foreground">{unreadCount} non lues</p>
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs font-tech text-system-blue hover:text-system-green transition-colors"
                                >
                                    TOUT LU
                                </button>
                            )}
                        </div>

                        {/* Notifications List */}
                        <div className="max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="w-8 h-8 border-2 border-system-blue/30 border-t-system-blue rounded-full animate-spin mx-auto" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-2 opacity-20" />
                                    <p className="font-tech text-sm text-muted-foreground">Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => {
                                            markAsRead(notif.id);
                                            setIsOpen(false);
                                        }}
                                        className={`p-4 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors ${!notif.read ? 'bg-system-blue/5' : ''
                                            }`}
                                    >
                                        <div className="flex gap-3">
                                            {/* Icon */}
                                            <div className="text-2xl flex-shrink-0">
                                                {getNotificationIcon(notif.type)}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className={`font-rajdhani font-bold text-sm ${notif.read ? 'text-white/70' : 'text-white'
                                                        }`}>
                                                        {notif.title}
                                                    </h4>
                                                    {!notif.read && (
                                                        <div className="w-2 h-2 bg-system-blue rounded-full flex-shrink-0 mt-1" />
                                                    )}
                                                </div>
                                                <p className={`font-tech text-xs mb-2 ${notif.read ? 'text-muted-foreground' : 'text-white/80'
                                                    }`}>
                                                    {notif.message}
                                                </p>
                                                <p className="font-tech text-xs text-muted-foreground">
                                                    {getTimeAgo(notif.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
