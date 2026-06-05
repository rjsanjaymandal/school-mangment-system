"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, X, Check, Trash2, Mail, MessageSquare, Smartphone, Calendar, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    priority?: "low" | "medium" | "high";
}

const notificationIcons: Record<string, any> = {
    email: Mail,
    sms: MessageSquare,
    push: Smartphone,
    in_app: Bell,
    general: Bell,
    alert: AlertCircle,
    event: Calendar,
    payment: Bell,
    student: Bell,
    attendance: Bell,
    exam: Bell,
    message: MessageSquare,
    default: Bell
};

const typeColors: Record<string, string> = {
    email: "bg-blue-100 text-blue-600",
    sms: "bg-emerald-100 text-emerald-600",
    push: "bg-purple-100 text-purple-600",
    in_app: "bg-amber-100 text-amber-600",
    general: "bg-slate-100 text-slate-600",
    alert: "bg-rose-100 text-rose-600",
    event: "bg-purple-100 text-purple-600"
};

export function NotificationBell() {
    const supabase = createClient();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showPanel, setShowPanel] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchNotifications = async () => {
            const { data } = await supabase
                .from("notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(10);

            if (data) {
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
            }
        };

        fetchNotifications();

        const channel = supabase
            .channel("navbar-notifications")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
                const newNotification = payload.new as Notification;
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);

                const Icon = notificationIcons[newNotification.type] || notificationIcons.default;
                toast.success(newNotification.title, {
                    description: newNotification.message,
                    icon: <Icon className="h-4 w-4" />
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                setShowPanel(false);
            }
        };

        if (showPanel) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPanel]);

    const markAsRead = async (id: string) => {
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id);

        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, is_read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = async () => {
        await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("is_read", false);

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        toast.success("All marked as read");
    };

    return (
        <div className="relative" ref={panelRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
                onClick={() => setShowPanel(!showPanel)}
            >
                <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {showPanel && (
                <div className="absolute top-full mt-2 right-0 w-96 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50 to-slate-50">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-blue-500" />
                            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                            {unreadCount > 0 && (
                                <Badge className="bg-blue-500 text-white text-[10px]">{unreadCount} new</Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={markAllAsRead}
                                    className="h-7 text-xs text-emerald-600 hover:bg-emerald-50"
                                >
                                    <Check className="h-3 w-3 mr-1" />
                                    Mark all read
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-900"
                                onClick={() => setShowPanel(false)}
                            >
                                <X className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((notification) => {
                                    const Icon = notificationIcons[notification.type] || notificationIcons.default;
                                    const colorClass = typeColors[notification.type] || typeColors.general;
                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => {
                                                if (!notification.is_read) {
                                                    markAsRead(notification.id);
                                                }
                                            }}
                                            className={cn(
                                                "p-4 cursor-pointer transition-all hover:bg-slate-50",
                                                !notification.is_read ? "bg-blue-50/30" : ""
                                            )}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={cn("p-2.5 rounded-xl shrink-0", colorClass)}>
                                                    <Icon className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-sm font-semibold",
                                                                !notification.is_read ? "text-slate-900" : "text-slate-600"
                                                            )}>
                                                                {notification.title}
                                                            </span>
                                                            {notification.priority === "high" && (
                                                                <Badge className="bg-rose-500 text-white text-[8px] px-1 py-0.5 rounded">Urgent</Badge>
                                                            )}
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                            {format(new Date(notification.created_at), "HH:mm")}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{notification.message}</p>
                                                    {!notification.is_read && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                                            <span className="text-[10px] text-blue-600 font-medium">New</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700"
                            onClick={() => {
                                setShowPanel(false);
                            }}
                        >
                            View all notifications
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}