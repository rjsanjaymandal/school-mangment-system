"use client";

import { useState, useEffect, useRef } from "react";
import {
    MessageSquare, Send, Search, Plus, Inbox, SendHorizonal, Mail, MailOpen, Clock, User,
    MoreVertical, Phone, Video, Info, Paperclip, Smile, ShieldCheck, CheckCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessage, markMessageRead } from "@/app/actions/modules";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessagesService } from "@/lib/services/messages";

interface MessagesDashboardProps {
    initialConversations: any[];
    contacts: any[];
    currentUserId: string;
}

export function MessagesDashboard({ initialConversations, contacts, currentUserId }: MessagesDashboardProps) {
    const router = useRouter();
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [composeForm, setComposeForm] = useState({ receiver_id: "", subject: "", body: "" });
    
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    // Load messages when conversation is selected
    useEffect(() => {
        if (selectedConversation) {
            loadConversation(selectedConversation.contact.id);
        }
    }, [selectedConversation]);

    const loadConversation = async (contactId: string) => {
        const result = await MessagesService.getConversationMessages(currentUserId, contactId);
        if (result.data) {
            setMessages(result.data);
            // Mark last message as read if it's for us
            const lastMsg = result.data[result.data.length - 1];
            if (lastMsg && !lastMsg.is_read && lastMsg.receiver_id === currentUserId) {
                await markMessageRead(lastMsg.id);
            }
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() || !selectedConversation) return;
        
        const msgData = {
            receiver_id: selectedConversation.contact.id,
            subject: selectedConversation.last_message?.subject || "Direct Message",
            body: newMessage
        };

        const optimisticMsg = {
            id: Date.now().toString(),
            sender_id: currentUserId,
            receiver_id: selectedConversation.contact.id,
            body: newMessage,
            created_at: new Date().toISOString(),
            is_read: false,
            sender: { full_name: "You" }
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage("");

        const result = await sendMessage(msgData);
        if (result.success) {
            loadConversation(selectedConversation.contact.id);
            router.refresh();
        }
    };

    const handleCompose = async () => {
        if (!composeForm.receiver_id || !composeForm.body) return;
        setLoading(true);
        const result = await sendMessage(composeForm);
        setLoading(false);
        if (result.success) {
            setIsComposeOpen(false);
            setComposeForm({ receiver_id: "", subject: "", body: "" });
            router.refresh();
            // find and select the new conversation
        }
    };

    const filteredConversations = initialConversations.filter(c => 
        c.contact?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-140px)] flex gap-x-0 overflow-hidden rounded-3xl border border-white/20 bg-white/40 backdrop-blur-3xl shadow-2xl animate-in fade-in duration-700">
            
            {/* Conversations Sidebar */}
            <div className="w-96 border-r border-slate-200 flex flex-col bg-white/60 backdrop-blur-md">
                <div className="p-6 border-b border-slate-100 shrink-0">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-foreground flex items-center gap-x-2">
                            <MessageSquare className="h-5 w-5 text-blue-500" /> Matrix-Chat
                        </h2>
                        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                            <DialogTrigger asChild>
                                <Button size="icon" className="h-10 w-10 p-0 rounded-xl bg-slate-900 border-none hover:scale-105 transition-transform">
                                    <Plus className="h-5 w-5 text-white" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass border-none">
                                <DialogHeader><DialogTitle className="font-black text-2xl uppercase italic">Initiate Signal</DialogTitle></DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Recipient Node</Label>
                                        <Select value={composeForm.receiver_id} onValueChange={(v) => setComposeForm({ ...composeForm, receiver_id: v })}>
                                            <SelectTrigger className="rounded-xl border-slate-200"><SelectValue placeholder="Select target..." /></SelectTrigger>
                                            <SelectContent>
                                                {contacts.map(c => (
                                                    <SelectItem key={c.id} value={c.id} className="text-xs font-bold uppercase italic">
                                                        {c.full_name} <span className="text-[8px] opacity-40 ml-2">({c.role})</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Signal Subject</Label>
                                        <Input 
                                            value={composeForm.subject} 
                                            onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })} 
                                            placeholder="MISSION_PARAMETER..." 
                                            className="rounded-xl border-slate-200 uppercase text-[10px] font-bold tracking-widest"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest italic">Data Payload</Label>
                                        <textarea
                                            value={composeForm.body}
                                            onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                                            placeholder="Enter message details..."
                                            className="w-full h-32 rounded-xl border border-slate-200 p-4 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        />
                                    </div>
                                    <Button onClick={handleCompose} disabled={loading} className="w-full rounded-2xl py-6 bg-slate-900 text-white font-black uppercase tracking-[0.2em] italic transition-all active:scale-95">
                                        <Send className="h-4 w-4 mr-2" />
                                        {loading ? "Syncing..." : "Transmit Signal"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="relative group">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
                        <Input 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search operatives..." 
                            className="pl-10 h-10 rounded-xl bg-slate-100/50 border-transparent focus:bg-white focus:border-slate-200 transition-all text-xs font-bold uppercase tracking-widest"
                        />
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {filteredConversations.map((conv) => {
                            const isSelected = selectedConversation?.contact?.id === conv.contact.id;
                            return (
                                <button
                                    key={conv.contact.id}
                                    onClick={() => setSelectedConversation(conv)}
                                    className={cn(
                                        "w-full flex items-center gap-x-4 p-4 text-left transition-all rounded-2xl group relative",
                                        isSelected ? "bg-slate-900 shadow-xl" : "hover:bg-white/80"
                                    )}
                                >
                                    <div className="relative shrink-0">
                                        <div className={cn(
                                            "h-12 w-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm transition-all",
                                            isSelected ? "bg-white text-slate-900 scale-95" : "bg-card text-white group-hover:neon-blue"
                                        )}>
                                            {conv.contact.full_name?.[0]}
                                        </div>
                                        {conv.unread_count > 0 && (
                                            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-blue-500 text-white border-2 border-white rounded-full text-[9px] font-black">
                                                {conv.unread_count}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className={cn("text-xs font-black truncate uppercase tracking-tight italic", isSelected ? "text-white" : "text-slate-800")}>
                                                {conv.contact.full_name}
                                            </span>
                                            <span className={cn("text-[9px] font-bold shrink-0 opacity-40", isSelected ? "text-slate-400" : "text-muted-foreground")}>
                                                {new Date(conv.last_message?.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className={cn("text-[10px] font-bold truncate tracking-wide", isSelected ? "text-slate-400" : "text-muted-foreground")}>
                                            {conv.last_message?.body || "Start conversation..."}
                                        </p>
                                    </div>
                                    {isSelected && <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-8 bg-blue-500 rounded-full" />}
                                </button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            {/* Chat Panel */}
            <div className="flex-1 flex flex-col bg-white/20 backdrop-blur-sm relative">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-6 border-bottom border-slate-200 bg-white/40 backdrop-blur-md flex items-center justify-between z-10">
                            <div className="flex items-center gap-x-4">
                                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                                    {selectedConversation.contact.full_name[0]}
                                </div>
                                <div>
                                    <h3 className="font-black text-sm text-foreground uppercase tracking-tight italic flex items-center gap-x-2">
                                        {selectedConversation.contact.full_name}
                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[8px] font-black tracking-[0.2em] px-2 h-4">ACTIVE</Badge>
                                    </h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">{selectedConversation.contact.role} Node</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-x-2">
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-white"><Phone className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-white"><Video className="h-4 w-4" /></Button>
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-white"><Info className="h-4 w-4" /></Button>
                                <div className="w-[1px] h-6 bg-slate-200 mx-2" />
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-slate-400 hover:text-slate-900 hover:bg-white"><MoreVertical className="h-4 w-4" /></Button>
                            </div>
                        </div>

                        {/* Messages Thread */}
                        <ScrollArea className="flex-1 p-8" viewportRef={scrollRef}>
                            <div className="space-y-6 max-w-4xl mx-auto">
                                <div className="text-center py-8">
                                    <div className="h-[1px] w-full bg-slate-100 flex items-center justify-center">
                                        <span className="bg-white/20 px-4 text-[9px] font-black uppercase text-slate-400 tracking-[0.4em] italic">Encrypted Secure Line</span>
                                    </div>
                                </div>

                                {messages.map((msg, idx) => {
                                    const isMe = msg.sender_id === currentUserId;
                                    const showAvatar = idx === 0 || messages[idx-1].sender_id !== msg.sender_id;
                                    
                                    return (
                                        <div key={msg.id} className={cn("flex items-end gap-x-3", isMe ? "flex-row-reverse" : "flex-row")}>
                                            <div className="flex flex-col gap-y-1 max-w-[70%]">
                                                <div className={cn(
                                                    "px-5 py-3 rounded-2xl text-xs font-semibold leading-relaxed shadow-sm relative group",
                                                    isMe ? "bg-slate-900 text-white rounded-br-none" : "bg-white text-slate-700 rounded-bl-none border border-white"
                                                )}>
                                                    {msg.body}
                                                    <div className={cn(
                                                        "absolute bottom-2 right-2 flex items-center gap-x-1 opacity-40 text-[8px] font-black group-hover:opacity-100 transition-opacity",
                                                        isMe ? "text-slate-400" : "text-slate-400"
                                                    )}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMe && <CheckCheck className="h-2.5 w-2.5 text-blue-400" />}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </ScrollArea>

                        {/* Input Area */}
                        <div className="p-6 bg-white/40 backdrop-blur-md border-t border-slate-200 shrink-0">
                            <div className="max-w-4xl mx-auto flex items-center gap-x-4 bg-white p-2 pl-4 rounded-2xl shadow-xl shadow-slate-200/50 border border-white">
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-blue-500 rounded-xl"><Plus className="h-5 w-5" /></Button>
                                <Input 
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                    placeholder="Execute signal transmission..." 
                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-xs font-bold uppercase tracking-widest placeholder:opacity-30"
                                />
                                <div className="flex items-center gap-x-1">
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-amber-500 rounded-xl"><Smile className="h-5 w-5" /></Button>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-blue-500 rounded-xl"><Paperclip className="h-5 w-5" /></Button>
                                    <Button 
                                        onClick={handleSend}
                                        className="h-10 w-10 p-0 rounded-xl bg-blue-500 hover:bg-blue-600 text-white shadow-lg neon-blue active:scale-90 transition-all"
                                    >
                                        <SendHorizonal className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>
                            <div className="text-center mt-3">
                                <p className="text-[8px] font-black uppercase text-muted-foreground tracking-[0.3em] italic flex items-center justify-center gap-x-2">
                                    <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" /> End-to-End Quantum Encryption Active
                                </p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30 group">
                        <div className="h-32 w-32 rounded-[2.5rem] bg-slate-900 text-white flex items-center justify-center shadow-2xl mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                             <MessageSquare className="h-16 w-16" />
                        </div>
                        <h3 className="font-black text-4xl text-slate-900 uppercase italic tracking-tighter">Cipher Deck</h3>
                        <p className="max-w-xs mt-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 leading-relaxed">
                            No signal active. Select a target operatives to begin secure communication protocols.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
