"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, X, IndianRupee, GraduationCap, ClipboardCheck, FileText, MessageSquare, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (data) {
        setNotifications(data);
        
        // Show toast for unread notifications
        const unread = data.filter((n: Notification) => !n.is_read);
        if (unread.length > 0) {
          toast.info(`${unread.length} new notifications`, {
            description: "Click to view all notifications"
          });
        }
      }
    };

    fetchNotifications();

    // Subscribe to new notifications
    const channel = supabase
      .channel("notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications" }, (payload) => {
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        
        // Show toast for new notification
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

  const markAsRead = async (id: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("is_read", false);
    
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <>
      {children}
      
      {/* Notification Panel */}
      {showPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowPanel(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 shadow-xl h-full overflow-hidden">
            <div className="p-4 border-b dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <button
                onClick={() => setShowPanel(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-2">
              <button
                onClick={markAllAsRead}
                className="text-sm text-emerald-600 hover:underline mb-2 px-2"
              >
                Mark all as read
              </button>
              
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-8">No notifications</p>
                ) : (
                  notifications.map((notification) => {
                    const Icon = notificationIcons[notification.type] || notificationIcons.default;
                    return (
                      <div
                        key={notification.id}
                        onClick={() => {
                          markAsRead(notification.id);
                          setShowPanel(false);
                        }}
                        className={`p-3 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 ${
                          !notification.is_read ? "bg-emerald-50 dark:bg-emerald-900/20" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{notification.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{notification.message}</p>
                            <p className="text-[10px] text-slate-400 mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <div className="h-2 w-2 bg-emerald-500 rounded-full" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Expose notification panel via window for now */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="fixed bottom-6 left-6 z-50"
        style={{ display: 'none' }}
        id="notification-trigger"
      />
    </>
  );
}