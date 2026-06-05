"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  SendHorizontal,
  Inbox,
  Mail,
  ArrowLeft,
  Users,
  CheckCheck,
  AlertCircle,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { sendMessage, markMessageRead } from "@/app/actions/modules";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessagesService } from "@/lib/services/messages";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { ERPCard } from "@/components/ui/erp-card";
import { DashboardStatCard } from "@/components/shared/DashboardStatCard";

interface MessagesDashboardProps {
  initialConversations: any[];
  contacts: any[];
  currentUserId: string;
}

const PRIORITIES = [
  { id: "low", label: "Low", color: "bg-slate-400" as const },
  { id: "normal", label: "Normal", color: "bg-blue-500" as const },
  { id: "high", label: "High", color: "bg-amber-500" as const },
  { id: "urgent", label: "Urgent", color: "bg-rose-500" as const },
];

function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority || priority === "normal") return null;
  const meta = PRIORITIES.find((p) => p.id === priority);
  if (!meta) return null;
  return (
    <Badge className={cn("text-[8px] px-1.5 py-0.5 font-black uppercase tracking-widest border-none text-white", meta.color)}>
      {meta.label}
    </Badge>
  );
}

export function MessagesDashboard({ initialConversations, contacts, currentUserId }: MessagesDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("inbox");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [composeForm, setComposeForm] = useState({ receiver_id: "", subject: "", body: "", priority: "normal" });
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (activeTab === "sent") {
      (async () => {
        const result = await MessagesService.getAllMessages({ sender_id: currentUserId });
        if (result.data) setSentMessages(result.data);
      })();
    }
  }, [activeTab, currentUserId]);

  const loadConversation = useCallback(async (contactId: string) => {
    const result = await MessagesService.getConversationMessages(currentUserId, contactId);
    if (result.data) {
      setMessages(result.data);
      const lastMsg = result.data[result.data.length - 1];
      if (lastMsg && !lastMsg.is_read && lastMsg.receiver_id === currentUserId) {
        await markMessageRead(lastMsg.id);
      }
    }
  }, [currentUserId]);

  const handleSelectConversation = useCallback((conv: any) => {
    setSelectedConversation(conv);
    if (conv) {
      void loadConversation(conv.contact.id);
    }
  }, [loadConversation]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    const optimisticMsg = {
      id: Date.now().toString(),
      sender_id: currentUserId,
      receiver_id: selectedConversation.contact.id,
      content: newMessage,
      body: newMessage,
      subject: selectedConversation.last_message?.subject || null,
      created_at: new Date().toISOString(),
      is_read: true,
      sender: { full_name: "You" },
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setNewMessage("");
    const result = await sendMessage({
      receiver_id: selectedConversation.contact.id,
      subject: selectedConversation.last_message?.subject || "Direct Message",
      body: newMessage,
    });
    if (result.success) {
      toast.success("Message sent");
      router.refresh();
    } else {
      toast.error("Failed to send");
    }
  };

  const handleCompose = async () => {
    if (!composeForm.receiver_id || !composeForm.body) {
      toast.error("Fill recipient and message");
      return;
    }
    setSending(true);
    const result = await sendMessage({
      receiver_id: composeForm.receiver_id,
      subject: composeForm.subject,
      body: composeForm.body,
      priority: composeForm.priority,
    });
    setSending(false);
    if (result.success) {
      toast.success("Message sent");
      setComposeForm({ receiver_id: "", subject: "", body: "", priority: "normal" });
      setActiveTab("sent");
      router.refresh();
    } else {
      toast.error("Failed to send");
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) return format(d, "HH:mm");
    if (isYesterday(d)) return "Yesterday";
    return format(d, "MMM d");
  };

  const filteredConversations = initialConversations.filter((c) =>
    c.contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalUnread = initialConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);
  const totalSent = sentMessages.length;
  const totalConversations = initialConversations.length;

  return (
    <div className="space-y-6 animate-in fade-in duration-700 mt-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <DashboardStatCard title="Conversations" value={totalConversations} icon={MessageSquare} color="blue" description="Active threads" />
        <DashboardStatCard title="Unread" value={totalUnread} icon={Inbox} color="amber" description="Awaiting reply" />
        <DashboardStatCard title="Sent" value={totalSent} icon={Send} color="emerald" description="Messages sent" />
        <DashboardStatCard title="Contacts" value={contacts.length} icon={Users} color="purple" description="Available people" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-0">
        {[
          { id: "inbox", label: "Inbox", icon: Inbox, badge: totalUnread },
          { id: "sent", label: "Sent", icon: Send, badge: 0 },
          { id: "compose", label: "New Message", icon: Plus, badge: 0 },
        ].map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex items-center gap-2 px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all",
              activeTab === tab.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300")}>
            <tab.icon className="h-4 w-4" /> {tab.label}
            {tab.badge > 0 && <Badge className="bg-blue-500 text-white text-[8px] px-1.5 py-0.5 font-black border-none">{tab.badge}</Badge>}
          </button>
        ))}
      </div>

      {/* Inbox */}
      {activeTab === "inbox" && (
        <ERPCard title="Inbox" description="Your conversations" color="blue" icon={<Inbox className="h-5 w-5" />}
          className="border-none shadow-xl rounded-2xl overflow-hidden">
          <div className="flex h-[calc(100vh-340px)]">
            <div className={cn("w-80 border-r border-slate-100 flex flex-col bg-white/40 shrink-0",
              selectedConversation ? "hidden md:flex" : "w-full")}>
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search conversations..." className="pl-11 h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-bold shadow-sm" />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {filteredConversations.length === 0 ? (
                  <div className="p-12 text-center flex flex-col items-center">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                      <Mail className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No conversations</p>
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {filteredConversations.map((conv) => {
                      const isSelected = selectedConversation?.contact?.id === conv.contact.id;
                      const hasUnread = conv.unread_count > 0;
                      const lastPriority = conv.last_message?.priority;
                      return (
                        <button key={conv.contact.id} onClick={() => handleSelectConversation(conv)}
                          className={cn("w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                            isSelected ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20" : hasUnread ? "bg-blue-50/70" : "hover:bg-slate-50")}>
                          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm",
                            isSelected ? "bg-white text-blue-600" : hasUnread ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600")}>
                            {conv.contact.full_name?.[0] || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className={cn("text-sm font-bold truncate flex items-center gap-1.5", isSelected ? "text-white" : "text-slate-900")}>
                                {conv.contact.full_name}
                                {lastPriority && lastPriority !== "normal" && <PriorityBadge priority={lastPriority} />}
                              </span>
                              <span className={cn("text-[10px] font-semibold shrink-0 ml-2", isSelected ? "text-white/60" : "text-slate-400")}>
                                {conv.last_message?.created_at ? formatTime(conv.last_message.created_at) : ""}
                              </span>
                            </div>
                            <p className={cn("text-xs truncate", isSelected ? "text-white/60" : "text-slate-500")}>
                              {conv.last_message?.subject || "Direct message"}
                            </p>
                          </div>
                          {hasUnread && !isSelected && <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className={cn("flex-1 flex flex-col bg-white/20", !selectedConversation ? "hidden md:flex" : "flex")}>
              {selectedConversation ? (
                <>
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg md:hidden" onClick={() => handleSelectConversation(null as any)}>
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="h-10 w-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-sm">
                        {selectedConversation.contact.full_name[0]}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white">{selectedConversation.contact.full_name}</p>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{selectedConversation.contact.role || "Staff"}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 text-slate-400">
                      {selectedConversation.last_message?.created_at
                        ? formatDistanceToNow(new Date(selectedConversation.last_message.created_at), { addSuffix: true })
                        : "No recent activity"}
                    </Badge>
                  </div>

                  <ScrollArea className="flex-1 p-5" viewportRef={scrollRef}>
                    <div className="space-y-4 max-w-2xl mx-auto">
                      {messages.map((msg) => {
                        const isMe = msg.sender_id === currentUserId;
                        return (
                          <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                            {!isMe && (
                              <div className="h-7 w-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {msg.sender?.full_name?.[0] || "?"}
                              </div>
                            )}
                            <div className={cn("px-4 py-3 rounded-2xl text-sm max-w-[70%]",
                              isMe ? "bg-blue-500 text-white rounded-br-md shadow-lg shadow-blue-500/20" : "bg-white text-slate-700 border border-slate-100 rounded-bl-md shadow-sm")}>
                              <div className="flex items-center gap-2 mb-1">
                                {msg.subject && <p className={cn("text-[10px] font-black uppercase tracking-widest", isMe ? "text-blue-200" : "text-slate-400")}>{msg.subject}</p>}
                                {msg.priority && msg.priority !== "normal" && <PriorityBadge priority={msg.priority} />}
                              </div>
                              <p className="whitespace-pre-wrap">{msg.content || msg.body}</p>
                              <div className={cn("flex items-center gap-1.5 mt-2", isMe ? "justify-end" : "justify-start")}>
                                <span className={cn("text-[9px] font-semibold", isMe ? "text-blue-200" : "text-slate-400")}>
                                  {format(new Date(msg.created_at), "HH:mm")}
                                </span>
                                {isMe && <CheckCheck className="h-3 w-3 text-blue-200" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>

                  <div className="px-5 py-4 bg-white/50 border-t border-slate-100 dark:border-slate-800">
                    <div className="max-w-2xl mx-auto flex items-center gap-3">
                      <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Type a message..." className="flex-1 rounded-xl border-slate-200 dark:border-slate-800 h-11 bg-white dark:bg-slate-900 shadow-sm" />
                      <Button onClick={handleSend} disabled={!newMessage.trim()}
                        className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-700 p-0 shadow-lg transition-all active:scale-95 disabled:opacity-50">
                        <SendHorizontal className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-8 w-8 text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400 mb-1">Select a conversation</p>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Choose from the list to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ERPCard>
      )}

      {/* Sent */}
      {activeTab === "sent" && (
        <ERPCard title="Sent Messages" description="Messages you have sent" color="emerald" icon={<Send className="h-5 w-5" />}
          className="border-none shadow-xl rounded-2xl overflow-hidden">
          <ScrollArea className="h-[calc(100vh-380px)]">
            {sentMessages.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Send className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-400 mb-1">No sent messages</p>
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Send your first message to get started</p>
              </div>
            ) : (
              <div className="p-4 space-y-3">
                {sentMessages.map((msg) => (
                  <div key={msg.id} className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold shrink-0 shadow-sm">
                        {msg.receiver?.full_name?.[0] || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">{msg.receiver?.full_name || "Unknown"}</span>
                            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400">
                              {msg.receiver?.role || "Staff"}
                            </Badge>
                            <PriorityBadge priority={msg.priority} />
                            <Badge className={cn("text-[8px] px-1.5 py-0.5 font-black uppercase tracking-widest border-none",
                              msg.is_read ? "bg-emerald-500 text-white" : "bg-amber-500 text-white")}>
                              {msg.is_read ? "Read" : "Unread"}
                            </Badge>
                          </div>
                          <span className="text-[10px] font-semibold text-slate-400 shrink-0 ml-2">
                            {format(new Date(msg.created_at), "MMM d, HH:mm")}
                          </span>
                        </div>
                        {msg.subject && <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{msg.subject}</p>}
                        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{msg.content || msg.body}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </ERPCard>
      )}

      {/* Compose */}
      {activeTab === "compose" && (
        <ERPCard title="New Message" description="Send a message to anyone" color="purple" icon={<Plus className="h-5 w-5" />}
          className="border-none shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6 max-w-xl space-y-5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Recipient</label>
              <select value={composeForm.receiver_id} onChange={(e) => setComposeForm({ ...composeForm, receiver_id: e.target.value })}
                className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 focus:border-blue-300 outline-none">
                <option value="" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Select recipient...</option>
                {contacts.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c.full_name} — {c.role}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Subject</label>
              <Input value={composeForm.subject} onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                placeholder="Enter subject..." className="rounded-xl border-slate-200 dark:border-slate-800 h-11" />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Priority</label>
              <div className="flex gap-2">
                {PRIORITIES.map((p) => (
                  <button key={p.id} onClick={() => setComposeForm({ ...composeForm, priority: p.id })}
                    className={cn("flex items-center justify-center gap-1.5 h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all px-4",
                      composeForm.priority === p.id ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800" : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700")}>
                    <div className={cn("h-2 w-2 rounded-full", p.color)} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-1.5">Message</label>
              <textarea value={composeForm.body} onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                placeholder="Write your message..."
                className="w-full h-40 rounded-xl border border-slate-200 dark:border-slate-800 p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => { setComposeForm({ receiver_id: "", subject: "", body: "", priority: "normal" }); setActiveTab("inbox"); }}
                className="rounded-xl h-11 px-6 text-[10px] font-black uppercase tracking-widest border-slate-200 dark:border-slate-800">Cancel</Button>
              <Button onClick={handleCompose} disabled={sending || !composeForm.receiver_id || !composeForm.body}
                className="rounded-xl h-11 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50">
                <Send className="h-4 w-4" /> {sending ? "Sending..." : "Send Message"}
              </Button>
            </div>
          </div>
        </ERPCard>
      )}
    </div>
  );
}
