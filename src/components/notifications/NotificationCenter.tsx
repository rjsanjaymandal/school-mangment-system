"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  Send,
  Mail,
  MessageSquare,
  Smartphone,
  Users,
  BookOpen,
  Calendar,
  IndianRupee,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Eye,
  EyeOff,
  BellRing,
  Megaphone,
  Radio
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  recipients: number;
  sent_at: string;
  status: "sent" | "pending" | "failed";
  channel: "all" | "students" | "staff" | "parents" | "custom";
}

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  priority?: "low" | "medium" | "high";
  channel?: "all" | "students" | "staff" | "parents" | "custom";
}

const CHANNELS = [
  { id: "all", name: "Everyone", icon: Users, count: 905, color: "emerald" },
  { id: "students", name: "Students", icon: BookOpen, count: 450, color: "blue" },
  { id: "parents", name: "Parents", icon: Users, count: 420, color: "purple" },
  { id: "staff", name: "Staff", icon: Calendar, count: 35, color: "amber" }
];

const TEMPLATES = [
  { id: "fee_reminder", name: "Fee Reminder", category: "Finance", icon: IndianRupee },
  { id: "attendance_alert", name: "Attendance Alert", category: "Attendance", icon: AlertCircle },
  { id: "exam_notice", name: "Exam Notice", category: "Academic", icon: CheckCircle },
  { id: "event_reminder", name: "Event Reminder", category: "Events", icon: Calendar },
  { id: "holiday_notice", name: "Holiday Notice", category: "General", icon: Bell },
  { id: "admission_enquiry", name: "Admission Enquiry", category: "Admissions", icon: Users }
];

const QUICK_SEND = [
  { id: "bulk_email", name: "Bulk Email", icon: Mail, color: "blue" },
  { id: "sms_batch", name: "SMS Batch", icon: MessageSquare, color: "emerald" },
  { id: "push_notification", name: "Push", icon: Smartphone, color: "purple" },
  { id: "in_app_broadcast", name: "In-App", icon: Radio, color: "amber" }
];

export function NotificationCenter() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [history, setHistory] = useState<Notification[]>([]);
  const [showCompose, setShowCompose] = useState(false);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [composeForm, setComposeForm] = useState({
    title: "",
    message: "",
    channel: "all",
    type: "email",
    priority: "medium" as "low" | "medium" | "high"
  });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(
        data.map((n) => ({
          ...n,
          priority: (n as any).priority || "medium"
        }))
      );
    }
    setLoading(false);
  }

  async function handleSend() {
    if (!composeForm.title || !composeForm.message) {
      toast.error("Please fill in all fields");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("notifications").insert({
        ...composeForm,
        is_read: false,
        sent_at: new Date().toISOString(),
        recipients: 0,
        status: "pending",
        created_at: new Date().toISOString()
      } as any);

      if (error) throw error;

      toast.success("Notification sent!");
      setShowCompose(false);
      setComposeForm({
        title: "",
        message: "",
        channel: "all",
        type: "email",
        priority: "medium"
      });
      loadNotifications();
    } catch (e: any) {
      toast.error(e.message);
    }
    setSending(false);
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.is_read).map((n) => n.id);
    for (const id of unread) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("All marked as read");
  }

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email":
        return Mail;
      case "sms":
        return MessageSquare;
      case "push":
        return Smartphone;
      default:
        return Bell;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return CheckCircle;
      case "pending":
        return Clock;
      case "failed":
        return XCircle;
      default:
        return AlertCircle;
    }
  };

  const filtered = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "unread" && !n.is_read) ||
      n.type === filter;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass futuristic-card rounded-2xl p-5">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Quick Send
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_SEND.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  className="flex-col h-auto py-3 gap-2"
                >
                  <item.icon className={cn("h-5 w-5", `text-${item.color}-500`)} />
                  <span className="text-xs">{item.name}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="glass futuristic-card rounded-2xl p-5">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Recipients
            </h4>
            <div className="space-y-2">
              {CHANNELS.map((channel) => (
                <div
                  key={channel.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn("p-1.5 rounded-lg bg-slate-100")}>
                      <channel.icon className="h-4 w-4 text-slate-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-700">
                      {channel.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {channel.count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="glass futuristic-card rounded-2xl p-5">
            <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-purple-500" />
              Templates
            </h4>
            <div className="space-y-2">
              {TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className="p-2.5 rounded-xl border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-2"
                >
                  <template.icon className="h-4 w-4 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      {template.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {template.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="glass futuristic-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold">Recent Notifications</h4>
              <div className="flex gap-1">
                {["all", "unread", "email", "sms"].map((type) => (
                  <Button
                    key={type}
                    variant={filter === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(type)}
                    className="text-xs capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search notifications..."
                  className="pl-10 rounded-lg h-9"
                />
              </div>
            </div>

            <ScrollArea className="h-[500px]">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading...
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No notifications
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((notification) => {
                    const Icon = getChannelIcon(notification.type);
                    return (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 rounded-xl border transition-all",
                          !notification.is_read
                            ? "bg-blue-50/50 border-l-4 border-l-blue-500 border-slate-200"
                            : "bg-white border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={cn(
                              "p-2.5 rounded-xl shrink-0",
                              notification.type === "email"
                                ? "bg-blue-100 text-blue-600"
                                : notification.type === "sms"
                                ? "bg-emerald-100 text-emerald-600"
                                : notification.type === "push"
                                ? "bg-purple-100 text-purple-600"
                                : "bg-slate-100 text-slate-600"
                            )}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-slate-900">
                                  {notification.title}
                                </span>
                                {!notification.is_read && (
                                  <Badge className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5">
                                    New
                                  </Badge>
                                )}
                                {notification.priority === "high" && (
                                  <Badge className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5">
                                    Urgent
                                  </Badge>
                                )}
                              </div>
                              <span className="text-[10px] text-muted-foreground">
                                {format(
                                  new Date(notification.created_at),
                                  "MMM d, HH:mm"
                                )}
                              </span>
                            </div>
                            <p className="text-sm text-slate-500 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-3">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {notification.type}
                              </Badge>
                              {notification.channel !== "all" && (
                                <Badge
                                  variant="outline"
                                  className="text-xs capitalize"
                                >
                                  {notification.channel}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>

      {showCompose && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass futuristic-card rounded-2xl w-full max-w-lg bg-white">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-blue-500" />
                Compose Notification
              </h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCompose(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Channel
                </label>
                <div className="flex gap-2">
                  {["email", "sms", "push", "in_app"].map((type) => (
                    <Button
                      key={type}
                      variant={composeForm.type === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setComposeForm({ ...composeForm, type })}
                      className="flex-1 text-xs capitalize"
                    >
                      {type === "email" && <Mail className="h-3 w-3 mr-1" />}
                      {type === "sms" && (
                        <MessageSquare className="h-3 w-3 mr-1" />
                      )}
                      {type === "push" && (
                        <Smartphone className="h-3 w-3 mr-1" />
                      )}
                      {type === "in_app" && <Bell className="h-3 w-3 mr-1" />}
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Recipients
                </label>
                <select
                  value={composeForm.channel}
                  onChange={(e) =>
                    setComposeForm({ ...composeForm, channel: e.target.value })
                  }
                  className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                >
                  {CHANNELS.map((channel) => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name} ({channel.count})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Priority
                  </label>
                  <select
                    value={composeForm.priority}
                    onChange={(e) =>
                      setComposeForm({
                        ...composeForm,
                        priority: e.target.value as any
                      })
                    }
                    className="w-full h-10 rounded-lg border border-slate-200 px-3 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Title
                </label>
                <Input
                  value={composeForm.title}
                  onChange={(e) =>
                    setComposeForm({ ...composeForm, title: e.target.value })
                  }
                  placeholder="Notification title..."
                  className="rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">
                  Message
                </label>
                <Textarea
                  value={composeForm.message}
                  onChange={(e) =>
                    setComposeForm({ ...composeForm, message: e.target.value })
                  }
                  placeholder="Write your message..."
                  className="rounded-lg resize-none h-24"
                />
              </div>
            </div>
            <div className="p-5 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCompose(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending}
                className="bg-blue-500 hover:bg-blue-600 gap-2"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}