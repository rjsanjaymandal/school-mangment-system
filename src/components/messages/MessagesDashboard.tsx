"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    MessageSquare,
    Send,
    Search,
    Plus,
    SendHorizontal,
    Paperclip,
    Smile,
    CheckCheck,
    Inbox,
    Mail,
    ArrowLeft,
    MoreVertical,
    Phone,
    Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { sendMessage, markMessageRead } from "@/app/actions/modules";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessagesService } from "@/lib/services/messages";
import { format, isToday, isYesterday } from "date-fns";

interface MessagesDashboardProps {
    initialConversations: any[];
    contacts: any[];
    currentUserId: string;
}

export function MessagesDashboard({ initialConversations, contacts, currentUserId }: MessagesDashboardProps) {
    const router = useRouter();
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sentMessages, setSentMessages] = useState<any[]>([]);
    
    const [composeForm, setComposeForm] = useState({ 
        receiver_id: "", 
        subject: "", 
        body: ""
    });
    const [sending, setSending] = useState(false);
    
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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

    useEffect(() => {
        const loadSent = async () => {
            const result = await MessagesService.getAllMessages({ sender_id: currentUserId });
            if (result.data) setSentMessages(result.data);
        };
        loadSent();
    }, [currentUserId]);

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConversation) return;
        
        const optimisticMsg = {
            id: Date.now().toString(),
            sender_id: currentUserId,
            receiver_id: selectedConversation.contact.id,
            content: newMessage,
            body: newMessage,
            created_at: new Date().toISOString(),
            is_read: true,
            sender: { full_name: "You" }
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage("");

        const result = await sendMessage({
            receiver_id: selectedConversation.contact.id,
            subject: selectedConversation.last_message?.subject || "Direct Message",
            body: newMessage
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
            body: composeForm.body
        });
        setSending(false);
        if (result.success) {
            toast.success("Message sent");
            setComposeForm({ receiver_id: "", subject: "", body: "" });
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

    const filteredConversations = initialConversations.filter(c => 
        c.contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalUnread = initialConversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Tabs defaultValue="inbox" className="w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <TabsList className="bg-muted/80 backdrop-blur-sm p-1 h-auto border border-border/50 rounded-xl">
                        <TabsTrigger value="inbox" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 gap-2 text-xs font-semibold">
                            <Inbox className="w-4 h-4" />
                            <span>Inbox</span>
                            {totalUnread > 0 && (
                                <Badge className="ml-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                    {totalUnread}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="sent" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 gap-2 text-xs font-semibold">
                            <Send className="w-4 h-4" />
                            <span>Sent</span>
                        </TabsTrigger>
                        <TabsTrigger value="compose" className="data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 py-2.5 gap-2 text-xs font-semibold">
                            <Plus className="w-4 h-4" />
                            <span>New Message</span>
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="inbox" className="outline-none">
                    <div className="glass futuristic-card rounded-2xl overflow-hidden flex h-[calc(100vh-280px)]">
                        {/* Conversation List */}
                        <div className={cn(
                            "w-80 border-r border-slate-200/60 flex flex-col bg-white/40",
                            selectedConversation ? "hidden md:flex" : "w-full"
                        )}>
                            <div className="p-4 border-b border-slate-200/60">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search..." 
                                        className="pl-10 h-9 rounded-lg bg-muted/50 border-transparent focus:bg-white"
                                    />
                                </div>
                            </div>
                            <ScrollArea className="flex-1">
                                {filteredConversations.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Mail className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                                        <p className="text-sm text-muted-foreground">No messages</p>
                                    </div>
                                ) : (
                                    filteredConversations.map((conv) => {
                                        const isSelected = selectedConversation?.contact?.id === conv.contact.id;
                                        const hasUnread = conv.unread_count > 0;
                                        return (
                                            <button
                                                key={conv.contact.id}
                                                onClick={() => handleSelectConversation(conv)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 p-4 text-left border-b border-slate-100/50 transition-all",
                                                    isSelected ? "bg-blue-500 text-white" : hasUnread ? "bg-blue-50/50" : "hover:bg-slate-50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0",
                                                    isSelected ? "bg-white text-blue-500" : hasUnread ? "bg-blue-500 text-white" : "bg-slate-100 text-slate-600"
                                                )}>
                                                    {conv.contact.full_name?.[0] || "?"}
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <span className={cn("text-sm font-semibold truncate", isSelected ? "text-white" : "text-slate-900")}>
                                                            {conv.contact.full_name}
                                                        </span>
                                                        <span className={cn("text-[10px]", isSelected ? "text-white/60" : "text-muted-foreground")}>
                                                            {conv.last_message?.created_at ? formatTime(conv.last_message.created_at) : ""}
                                                        </span>
                                                    </div>
                                                    <p className={cn("text-xs truncate", isSelected ? "text-white/60" : "text-muted-foreground")}>
                                                        {conv.last_message?.subject || "Direct message"}
                                                    </p>
                                                </div>
                                                {hasUnread && !isSelected && (
                                                    <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })
                                )}
                            </ScrollArea>
                        </div>

                        {/* Chat Area */}
                        <div className={cn("flex-1 flex flex-col bg-white/20", !selectedConversation ? "hidden md:flex" : "flex")}>
                            {selectedConversation ? (
                                <>
                                    <div className="p-4 border-b border-slate-200/60 bg-white/50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden" onClick={() => handleSelectConversation(null)}>
                                                <ArrowLeft className="h-4 w-4" />
                                            </Button>
                                            <div className="h-10 w-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                                                {selectedConversation.contact.full_name[0]}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-sm">{selectedConversation.contact.full_name}</p>
                                                <p className="text-xs text-muted-foreground capitalize">{selectedConversation.contact.role}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="h-9 w-9"><Phone className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9"><Video className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9"><MoreVertical className="h-4 w-4" /></Button>
                                        </div>
                                    </div>

                                    <ScrollArea className="flex-1 p-6" viewportRef={scrollRef}>
                                        <div className="space-y-4 max-w-2xl mx-auto">
                                            {messages.map((msg) => {
                                                const isMe = msg.sender_id === currentUserId;
                                                return (
                                                    <div key={msg.id} className={cn("flex items-end gap-2", isMe ? "justify-end" : "justify-start")}>
                                                        {!isMe && (
                                                            <div className="h-7 w-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">
                                                                {msg.sender?.full_name?.[0] || "?"}
                                                            </div>
                                                        )}
                                                        <div className={cn(
                                                            "px-4 py-2.5 rounded-2xl text-sm max-w-[70%]",
                                                            isMe ? "bg-blue-500 text-white rounded-br-md" : "bg-white text-slate-700 border border-slate-100 rounded-bl-md"
                                                        )}>
                                                            {msg.subject && <p className="text-xs font-semibold mb-1 opacity-60">{msg.subject}</p>}
                                                            <p className="whitespace-pre-wrap">{msg.content || msg.body}</p>
                                                            <p className={cn("text-[10px] mt-1", isMe ? "text-white/50" : "text-slate-400")}>
                                                                {format(new Date(msg.created_at), "HH:mm")}
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollArea>

                                    <div className="p-4 bg-white/50 border-t border-slate-200/60">
                                        <div className="max-w-2xl mx-auto flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Paperclip className="h-4 w-4" /></Button>
                                            <Input 
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                                placeholder="Type a message..." 
                                                className="flex-1 rounded-lg"
                                            />
                                            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"><Smile className="h-4 w-4" /></Button>
                                            <Button onClick={handleSend} disabled={!newMessage.trim()} className="h-9 w-9 p-0 bg-blue-500 hover:bg-blue-600 shrink-0">
                                                <SendHorizontal className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="text-center">
                                        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="font-semibold">Select a conversation</p>
                                        <p className="text-sm text-muted-foreground mt-1">Choose from the list to start chatting</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="sent" className="outline-none">
                    <div className="glass futuristic-card rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-slate-200/60">
                            <h3 className="text-sm font-semibold flex items-center gap-2">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full" />
                                Sent Messages
                            </h3>
                        </div>
                        <ScrollArea className="h-[calc(100vh-340px)]">
                            {sentMessages.length === 0 ? (
                                <div className="p-8 text-center">
                                    <Send className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">No sent messages</p>
                                </div>
                            ) : (
                                sentMessages.map((msg) => (
                                    <div key={msg.id} className="p-4 border-b border-slate-100/50">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                    {msg.receiver?.full_name?.[0] || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{msg.receiver?.full_name || "Unknown"}</p>
                                                    <p className="text-xs text-muted-foreground">{msg.receiver?.role}</p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground">
                                                {format(new Date(msg.created_at), "MMM d, HH:mm")}
                                            </span>
                                        </div>
                                        {msg.subject && <p className="text-xs font-semibold text-slate-700 mb-1">{msg.subject}</p>}
                                        <p className="text-sm text-slate-500">{msg.content || msg.body}</p>
                                    </div>
                                ))
                            )}
                        </ScrollArea>
                    </div>
                </TabsContent>

                <TabsContent value="compose" className="outline-none">
                    <div className="glass futuristic-card rounded-2xl p-6">
                        <h3 className="text-sm font-semibold flex items-center gap-2 mb-6">
                            <span className="w-1 h-4 bg-blue-500 rounded-full" />
                            New Message
                        </h3>
                        <div className="max-w-xl space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">To</Label>
                                <select 
                                    value={composeForm.receiver_id}
                                    onChange={(e) => setComposeForm({ ...composeForm, receiver_id: e.target.value })}
                                    className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
                                >
                                    <option value="">Select recipient...</option>
                                    {contacts.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.full_name} ({c.role})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Subject</Label>
                                <Input 
                                    value={composeForm.subject}
                                    onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                                    placeholder="Enter subject..."
                                    className="rounded-lg"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold text-muted-foreground">Message</Label>
                                <textarea
                                    value={composeForm.body}
                                    onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                                    placeholder="Write your message..."
                                    className="w-full h-40 rounded-lg border border-slate-200 p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleCompose} disabled={sending || !composeForm.receiver_id || !composeForm.body} className="bg-blue-500 hover:bg-blue-600">
                                    <Send className="h-4 w-4 mr-2" />
                                    {sending ? "Sending..." : "Send Message"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}