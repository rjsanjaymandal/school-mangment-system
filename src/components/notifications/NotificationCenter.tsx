"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Bell,
  Send,
  BookOpen,
  Calendar,
  ShieldAlert,
  Settings,
  CheckCircle,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  Inbox,
  Clock,
  Megaphone,
  FileText,
  Users,
  Mail,
  GraduationCap,
  UserCheck,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string | null;
  is_read: boolean;
  created_at: string;
}

const NOTIFICATION_TYPES = [
  { id: "general", label: "General", icon: Bell, color: "slate" as const },
  { id: "academic", label: "Academic", icon: BookOpen, color: "blue" as const },
  { id: "event", label: "Event", icon: Calendar, color: "purple" as const },
  { id: "emergency", label: "Emergency", icon: ShieldAlert, color: "rose" as const },
  { id: "system", label: "System", icon: Settings, color: "emerald" as const },
];

const TARGET_AUDIENCES = [
  { id: "everyone", label: "Everyone", icon: Users, desc: "All users" },
  { id: "students", label: "Students", icon: GraduationCap, desc: "All students" },
  { id: "parents", label: "Parents", icon: UserCheck, desc: "All parents" },
  { id: "staff", label: "Staff", icon: Users, desc: "Teachers & staff" },
];

const TEMPLATES = [
  { id: "fee_reminder", name: "Fee Reminder", icon: Bell, type: "general", target: "parents", title: "Fee Payment Reminder", message: "Dear Parent, this is a reminder that the school fee payment for the current term is due. Please make the payment at your earliest convenience to avoid late fees. Thank you for your cooperation." },
  { id: "exam_schedule", name: "Exam Schedule", icon: BookOpen, type: "academic", target: "students", title: "Examination Schedule Published", message: "The examination schedule for the upcoming term has been published on the portal. Please check your exam dates, timings, and seating arrangements. Prepare well and best of luck!" },
  { id: "holiday", name: "Holiday Notice", icon: Calendar, type: "event", target: "everyone", title: "School Holiday Notice", message: "Please note that the school will remain closed on the following dates as per the academic calendar. Regular classes will resume as scheduled. Enjoy the break!" },
  { id: "emergency", name: "Emergency Alert", icon: ShieldAlert, type: "emergency", target: "everyone", title: "URGENT: School Closure", message: "Due to unforeseen circumstances, the school will remain closed today. All academic activities are suspended. Please stay safe and check the portal for further updates." },
  { id: "ptm", name: "PTM Reminder", icon: MessageSquare, type: "academic", target: "parents", title: "Parent-Teacher Meeting", message: "Dear Parent, the Parent-Teacher Meeting is scheduled. Kindly make arrangements to attend and discuss your child's academic progress with the respective teachers." },
  { id: "results", name: "Results Published", icon: FileText, type: "academic", target: "students", title: "Examination Results Published", message: "The examination results have been published on the portal. Log in using your credentials to view your subject-wise marks and overall performance." },
  { id: "staff_meeting", name: "Staff Meeting", icon: Users, type: "system", target: "staff", title: "Staff Meeting Notice", message: "A staff meeting has been scheduled. All teaching and non-teaching staff are requested to attend. Attendance is mandatory." },
  { id: "event_invite", name: "Event Invitation", icon: Calendar, type: "event", target: "everyone", title: "Annual Sports Day Invitation", message: "The school cordially invites all students, parents, and staff to the Annual Sports Day. Your presence and participation will make the event a grand success." },
];

const ITEMS_PER_PAGE = 10;

function getBaseType(type: string) {
  return type.split(":")[0];
}

function getTarget(type: string) {
  const parts = type.split(":");
  return parts.length > 1 ? parts[1] : "everyone";
}

function getTypeMeta(type: string) {
  return NOTIFICATION_TYPES.find((t) => t.id === getBaseType(type)) || NOTIFICATION_TYPES[0];
}

function getTargetMeta(type: string) {
  return TARGET_AUDIENCES.find((t) => t.id === getTarget(type)) || TARGET_AUDIENCES[0];
}

function TypeBadge({ type }: { type: string }) {
  const meta = getTypeMeta(type);
  return (
    <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-200 dark:border-slate-800 text-slate-400 shrink-0">
      {meta.label}
    </Badge>
  );
}

function TargetBadge({ type }: { type: string }) {
  const target = getTarget(type);
  if (target === "everyone") return null;
  const meta = TARGET_AUDIENCES.find((t) => t.id === target);
  if (!meta) return null;
  return (
    <Badge variant="outline" className="text-[8px] font-bold uppercase tracking-widest border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 shrink-0">
      {meta.label}
    </Badge>
  );
}

export function NotificationCenter() {
  const supabase = createClient();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [targetFilter, setTargetFilter] = useState("all");
  const [readFilter, setReadFilter] = useState<"all" | "read" | "unread">("all");
  const [page, setPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [composeForm, setComposeForm] = useState({ title: "", message: "", type: "general", target: "everyone" });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (!cancelled) {
        if (data) setNotifications(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  const filtered = useMemo(() => {
    let result = notifications;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((n) => n.title.toLowerCase().includes(q) || (n.message && n.message.toLowerCase().includes(q)));
    }
    if (typeFilter !== "all") result = result.filter((n) => getBaseType(n.type) === typeFilter);
    if (targetFilter !== "all") result = result.filter((n) => getTarget(n.type) === targetFilter);
    if (readFilter === "unread") result = result.filter((n) => !n.is_read);
    if (readFilter === "read") result = result.filter((n) => n.is_read);
    return result;
  }, [notifications, searchTerm, typeFilter, targetFilter, readFilter]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const safePage = Math.min(page, totalPages || 1);
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  const stats = useMemo(() => ({
    total: notifications.length,
    unread: notifications.filter((n) => !n.is_read).length,
    sentToday: notifications.filter(
      (n) => format(new Date(n.created_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
    ).length,
    typeCount: NOTIFICATION_TYPES.length,
  }), [notifications]);

  async function handleSend() {
    if (!composeForm.title.trim() || !composeForm.message.trim()) {
      toast.error("Title and message are required");
      return;
    }
    setSending(true);
    try {
      const dbType = composeForm.target === "everyone" ? composeForm.type : `${composeForm.type}:${composeForm.target}`;
      const { error } = await supabase.from("notifications").insert({
        title: composeForm.title.trim(),
        message: composeForm.message.trim(),
        type: dbType,
        is_read: false,
        created_at: new Date().toISOString(),
      });
      if (error) throw error;
      toast.success("Notification sent");
      setShowCompose(false);
      setSelectedTemplate(null);
      setComposeForm({ title: "", message: "", type: "general", target: "everyone" });
      const { data: refreshed } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (refreshed) setNotifications(refreshed);
    } catch (e: any) {
      toast.error(e.message);
    }
    setSending(false);
  }

  async function markAllRead() {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    for (const id of unreadIds) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    }
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    toast.success("All marked as read");
  }

  async function toggleRead(id: string, current: boolean) {
    await supabase.from("notifications").update({ is_read: !current }).eq("id", id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: !current } : n)));
  }

  async function deleteNotification(id: string) {
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  }

  function applyTemplate(tplId: string) {
    const tpl = TEMPLATES.find((t) => t.id === tplId);
    if (!tpl) return;
    setSelectedTemplate(tplId);
    setComposeForm({ title: tpl.title, message: tpl.message, type: tpl.type, target: tpl.target });
    setShowCompose(true);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 mt-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard title="Total" value={stats.total} icon={Inbox} color="blue" description="All notifications" />
        <DashboardStatCard title="Unread" value={stats.unread} icon={Bell} color="amber" description="Awaiting review" />
        <DashboardStatCard title="Sent Today" value={stats.sentToday} icon={Send} color="emerald" description="Notifications sent" />
        <DashboardStatCard title="Categories" value={stats.typeCount} icon={BookOpen} color="purple" description="Notification types" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="space-y-6">
          <ERPCard title="Compose" description="Send a new notification" color="blue" icon={<Megaphone className="h-5 w-5" />}
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="p-4 space-y-3">
              <Button onClick={() => { setSelectedTemplate(null); setComposeForm({ title: "", message: "", type: "general", target: "everyone" }); setShowCompose(true); }}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all active:scale-95">
                <Send className="h-4 w-4" /> New Notification
              </Button>
              <Link href="/messages" className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-blue-800/40 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-all group">
                <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                  <MessageSquare className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400">Go to Messages</span>
              </Link>
            </div>
          </ERPCard>

          <ERPCard title="Templates" description="Pre-built notifications" color="amber" icon={<FileText className="h-5 w-5" />}
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="p-4 space-y-1.5">
              {TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <button key={tpl.id} onClick={() => applyTemplate(tpl.id)}
                    className={cn("w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left",
                      selectedTemplate === tpl.id ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20" : "border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700")}>
                    <div className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                      <Icon className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300 block">{tpl.name}</span>
                      <span className="text-[8px] font-semibold text-slate-400">{TARGET_AUDIENCES.find(t => t.id === tpl.target)?.label}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </ERPCard>

          <ERPCard title="Categories" color="purple" icon={<BookOpen className="h-5 w-5" />}
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="p-4 space-y-1.5">
              {NOTIFICATION_TYPES.map((nt) => {
                const Icon = nt.icon;
                const count = notifications.filter((n) => getBaseType(n.type) === nt.id).length;
                return (
                  <button key={nt.id} onClick={() => setTypeFilter(typeFilter === nt.id ? "all" : nt.id)}
                    className={cn("w-full flex items-center justify-between p-2.5 rounded-xl transition-all", typeFilter === nt.id ? "bg-slate-100 dark:bg-slate-800" : "hover:bg-slate-50 dark:hover:bg-slate-900/50")}>
                    <div className="flex items-center gap-2.5">
                      <div className={cn("p-1.5 rounded-lg", nt.color === "blue" ? "bg-blue-100 dark:bg-blue-950/40" : nt.color === "rose" ? "bg-rose-100 dark:bg-rose-950/40" : nt.color === "purple" ? "bg-purple-100 dark:bg-purple-950/40" : nt.color === "emerald" ? "bg-emerald-100 dark:bg-emerald-950/40" : "bg-slate-100 dark:bg-slate-800")}>
                        <Icon className={cn("h-3.5 w-3.5", nt.color === "blue" ? "text-blue-600 dark:text-blue-400" : nt.color === "rose" ? "text-rose-600 dark:text-rose-400" : nt.color === "purple" ? "text-purple-600 dark:text-purple-400" : nt.color === "emerald" ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400")} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{nt.label}</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black border-slate-200 dark:border-slate-800">{count}</Badge>
                  </button>
                );
              })}
            </div>
          </ERPCard>

          <ERPCard title="Audience" description="Filter by target group" color="blue" icon={<Users className="h-5 w-5" />}
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="p-4 space-y-1.5">
              {TARGET_AUDIENCES.map((ta) => {
                const Icon = ta.icon;
                const count = notifications.filter((n) => getTarget(n.type) === ta.id).length;
                return (
                  <button key={ta.id} onClick={() => setTargetFilter(targetFilter === ta.id ? "all" : ta.id)}
                    className={cn("w-full flex items-center justify-between p-2.5 rounded-xl transition-all", targetFilter === ta.id ? "bg-blue-50 dark:bg-blue-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-900/50")}>
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/40">
                        <Icon className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{ta.label}</span>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black border-slate-200 dark:border-slate-800">{count}</Badge>
                  </button>
                );
              })}
            </div>
          </ERPCard>
        </div>

        {/* Main */}
        <div className="lg:col-span-3">
          <ERPCard title="Notification Log" description="History of all sent notifications" color="blue" icon={<Inbox className="h-5 w-5" />}
            className="glass futuristic-card border-none shadow-xl rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search notifications..." className="pl-11 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm"
                    value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  {(["all", "unread", "read"] as const).map((opt) => (
                    <button key={opt} onClick={() => setReadFilter(opt)}
                      className={cn("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all",
                        readFilter === opt ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50" : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700")}>
                      {opt}
                    </button>
                  ))}
                  {stats.unread > 0 && (
                    <Button variant="outline" size="sm" onClick={markAllRead} className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Mark Read
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (<div key={i} className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />))}
                  </div>
                </div>
              ) : paginated.length === 0 ? (
                <div className="p-16 text-center flex flex-col items-center">
                  <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Bell className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 mb-1">No notifications found</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    {searchTerm || typeFilter !== "all" || readFilter !== "all" || targetFilter !== "all"
                      ? "Try adjusting your filters"
                      : "Send your first notification to get started"}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {paginated.map((n) => {
                    const meta = getTypeMeta(n.type);
                    const Icon = meta.icon;
                    const isToday = format(new Date(n.created_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                    const timeStr = isToday ? format(new Date(n.created_at), "h:mm a") : format(new Date(n.created_at), "MMM d, h:mm a");
                    const targetMeta = getTargetMeta(n.type);

                    return (
                      <div key={n.id}
                        className={cn("p-4 rounded-2xl border transition-all group hover:shadow-sm",
                          !n.is_read ? "bg-blue-50/70 border-l-4 border-l-blue-500 border-blue-100 dark:bg-blue-950/25 dark:border-blue-900/40 dark:border-l-blue-500" : "bg-white dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700")}>
                        <div className="flex items-start gap-3">
                          <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                            meta.color === "blue" ? "bg-blue-500 text-white" :
                            meta.color === "rose" ? "bg-rose-500 text-white" :
                            meta.color === "purple" ? "bg-purple-500 text-white" :
                            meta.color === "emerald" ? "bg-emerald-500 text-white" :
                            "bg-slate-500 text-white")}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{n.title}</span>
                              {!n.is_read && (
                                <Badge className="bg-blue-500 text-white text-[8px] px-1.5 py-0.5 font-black uppercase tracking-widest border-none shrink-0">New</Badge>
                              )}
                              <TypeBadge type={n.type} />
                              <TargetBadge type={n.type} />
                            </div>
                            {n.message && (
                              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-2">{n.message}</p>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3 text-slate-300" />
                              <span className="text-[10px] font-semibold text-slate-400">{timeStr}</span>
                              <span className="text-slate-200">·</span>
                              <span className="text-[10px] font-semibold text-slate-400">
                                {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button onClick={() => toggleRead(n.id, n.is_read)}
                              className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                              title={n.is_read ? "Mark unread" : "Mark read"}>
                              {n.is_read ? <Mail className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500" /> : <CheckCircle className="h-3.5 w-3.5 text-blue-500" />}
                            </button>
                            <button onClick={() => deleteNotification(n.id)}
                              className="h-7 w-7 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-100 dark:hover:bg-red-950/30 flex items-center justify-center transition-colors"
                              title="Delete">
                              <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {page} of {totalPages}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                    className="h-8 w-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <ChevronLeft className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={cn("h-8 w-8 rounded-lg text-[10px] font-black transition-colors",
                        p === page ? "bg-blue-600 text-white" : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800")}>
                      {p}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="h-8 w-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                    <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  </button>
                </div>
              </div>
            )}
          </ERPCard>
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                  <Megaphone className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white text-lg font-black tracking-tight">
                    {selectedTemplate ? "Use Template" : "New Notification"}
                  </h3>
                  <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                    {selectedTemplate ? TEMPLATES.find((t) => t.id === selectedTemplate)?.name : "Broadcast to users"}
                  </p>
                </div>
              </div>
              <button onClick={() => { setShowCompose(false); setSelectedTemplate(null); }}
                className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Category</label>
                <div className="flex gap-2 flex-wrap">
                  {NOTIFICATION_TYPES.map((nt) => {
                    const Icon = nt.icon;
                    return (
                      <button key={nt.id} onClick={() => setComposeForm({ ...composeForm, type: nt.id })}
                        className={cn("flex items-center justify-center gap-1.5 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all px-3",
                          composeForm.type === nt.id ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50" : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700")}>
                        <Icon className="h-3.5 w-3.5" /> {nt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Target Audience</label>
                <div className="flex gap-2 flex-wrap">
                  {TARGET_AUDIENCES.map((ta) => {
                    const Icon = ta.icon;
                    return (
                      <button key={ta.id} onClick={() => setComposeForm({ ...composeForm, target: ta.id })}
                        className={cn("flex items-center justify-center gap-1.5 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all px-3",
                          composeForm.target === ta.id ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50" : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700")}>
                        <Icon className="h-3.5 w-3.5" /> {ta.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Title</label>
                <Input value={composeForm.title} onChange={(e) => setComposeForm({ ...composeForm, title: e.target.value })}
                  placeholder="Notification title..." className="rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 h-11" />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Message</label>
                <Textarea value={composeForm.message} onChange={(e) => setComposeForm({ ...composeForm, message: e.target.value })}
                  placeholder="Write your message..." className="rounded-xl bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 resize-none h-28" />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[8px] font-semibold text-slate-400">
                  Sending to: <span className="font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{TARGET_AUDIENCES.find((t) => t.id === composeForm.target)?.label}</span>
                  {composeForm.target !== "everyone" && <span className="ml-1">via {NOTIFICATION_TYPES.find((t) => t.id === composeForm.type)?.label} channel</span>}
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setShowCompose(false); setSelectedTemplate(null); }}
                    className="rounded-xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800">Cancel</Button>
                  <Button onClick={handleSend} disabled={sending}
                    className="rounded-xl h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all active:scale-95">
                    <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send Notification"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
