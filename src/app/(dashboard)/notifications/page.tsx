"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Bell, Send, Filter, Check, Trash2, MessageSquare, Mail, Phone, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ERPCard } from "@/components/ui/erp-card";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  recipient_type: string;
  created_at: string;
  is_read: boolean;
  sent_to?: string;
}

const NOTIFICATION_TYPES = [
  { value: "general", label: "General Notice", icon: Bell },
  { value: "alert", label: "Alert/Urgent", icon: AlertCircle },
  { value: "event", label: "Event", icon: MessageSquare },
  { value: "fee", label: "Fee Reminder", icon: Bell },
  { value: "attendance", label: "Attendance", icon: Bell },
];

export default function NotificationsPage() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [filter, setFilter] = useState("all");
  const [sending, setSending] = useState(false);

  const [composeForm, setComposeForm] = useState({
    title: "",
    message: "",
    type: "general",
    recipient_type: "all",
    class_id: "",
  });

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error && error.code !== "PGRST116") throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }

  async function sendNotification() {
    if (!composeForm.title || !composeForm.message) {
      toast.error("Please fill in title and message");
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.from("notifications").insert({
        title: composeForm.title,
        message: composeForm.message,
        type: composeForm.type,
        recipient_type: composeForm.recipient_type,
        is_read: false,
        created_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success("Notification sent successfully!");
      setShowCompose(false);
      setComposeForm({
        title: "",
        message: "",
        type: "general",
        recipient_type: "all",
        class_id: "",
      });
      loadNotifications();
    } catch (error: any) {
      toast.error(error.message || "Failed to send notification");
    } finally {
      setSending(false);
    }
  }

  async function markAsRead(id: string) {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function deleteNotification(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success("Notification deleted");
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.is_read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications Center</h1>
          <p className="text-muted-foreground">Send and manage announcements</p>
        </div>
        <Button onClick={() => setShowCompose(true)} className="bg-blue-600 hover:bg-blue-700">
          <Send className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="h-4 w-4" />
            Total
          </div>
          <p className="text-2xl font-bold mt-1">{notifications.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-blue-600">
            <Bell className="h-4 w-4" />
            Unread
          </div>
          <p className="text-2xl font-bold text-blue-700 mt-1">{unreadCount}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-emerald-600">
            <MessageSquare className="h-4 w-4" />
            General
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {notifications.filter(n => n.type === "general").length}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-sm text-amber-600">
            <AlertCircle className="h-4 w-4" />
            Urgent
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-1">
            {notifications.filter(n => n.type === "alert").length}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="alert">Alerts</SelectItem>
            <SelectItem value="event">Events</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No notifications</div>
        ) : (
          filteredNotifications.map(notification => (
            <div
              key={notification.id}
              className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${
                !notification.is_read ? "border-l-4 border-l-blue-500 bg-blue-50/30" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    notification.type === "alert" ? "bg-red-100" :
                    notification.type === "event" ? "bg-purple-100" :
                    notification.type === "fee" ? "bg-amber-100" :
                    "bg-blue-100"
                  }`}>
                    <Bell className={`h-4 w-4 ${
                      notification.type === "alert" ? "text-red-600" :
                      notification.type === "event" ? "text-purple-600" :
                      notification.type === "fee" ? "text-amber-600" :
                      "text-blue-600"
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{notification.title}</h3>
                      {!notification.is_read && (
                        <Badge variant="default" className="bg-blue-600 text-[10px]">New</Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">{notification.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Compose Notification</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Notification title"
                  value={composeForm.title}
                  onChange={(e) => setComposeForm({ ...composeForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  placeholder="Enter notification message..."
                  rows={4}
                  value={composeForm.message}
                  onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <Select value={composeForm.type} onValueChange={(v) => setComposeForm({ ...composeForm, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {NOTIFICATION_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Send To</label>
                  <Select value={composeForm.recipient_type} onValueChange={(v) => setComposeForm({ ...composeForm, recipient_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="students">All Students</SelectItem>
                      <SelectItem value="parents">All Parents</SelectItem>
                      <SelectItem value="teachers">All Teachers</SelectItem>
                      <SelectItem value="staff">All Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCompose(false)}>Cancel</Button>
              <Button onClick={sendNotification} disabled={sending} className="bg-blue-600">
                {sending ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}