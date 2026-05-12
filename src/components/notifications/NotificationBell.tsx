"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, X, IndianRupee, GraduationCap, ClipboardCheck, FileText, MessageSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const notificationIcons: Record<string, any> = {
  payment: IndianRupee,
  student: GraduationCap,
  attendance: ClipboardCheck,
  exam: FileText,
  message: MessageSquare,
  event: Calendar,
  default: Bell
};

export function NotificationBell() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

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
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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
  };

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative h-9 w-9 rounded-md hover:bg-slate-100"
        onClick={() => setShowPanel(!showPanel)}
      >
        <Bell className="h-4 w-4 text-slate-500" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
        )}
      </Button>
      
      {showPanel && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-slate-900 border rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          <div className="p-3 border-b dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <button onClick={() => setShowPanel(false)}>
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>
          
          <div className="overflow-y-auto max-h-72">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="w-full text-xs text-emerald-600 hover:underline p-2 border-b"
              >
                Mark all as read
              </button>
            )}
            
            {notifications.length === 0 ? (
              <p className="text-center text-slate-500 py-8 text-sm">No notifications</p>
            ) : (
              notifications.map((notification) => {
                const Icon = notificationIcons[notification.type] || notificationIcons.default;
                return (
                  <div
                    key={notification.id}
                    onClick={() => {
                      markAsRead(notification.id);
                    }}
                    className={`p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 border-b last:border-b-0 ${
                      !notification.is_read ? "bg-emerald-50/50 dark:bg-emerald-900/10" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                        <Icon className="h-3 w-3 text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                        <p className="text-xs text-slate-500 truncate">{notification.message}</p>
                      </div>
                      {!notification.is_read && (
                        <div className="h-2 w-2 bg-emerald-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </>
  );
}