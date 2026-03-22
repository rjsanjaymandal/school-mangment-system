"use client";

import { useState } from "react";
import {
    MessageSquare, Send, Search, Plus, Inbox, SendHorizonal, Mail, MailOpen, Clock, User,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessage, markMessageRead } from "@/app/actions/modules";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface MessagesDashboardProps {
    inbox: any[];
    sent: any[];
    contacts: any[];
    currentUserId: string;
}

export function MessagesDashboard({ inbox, sent, contacts, currentUserId }: MessagesDashboardProps) {
    const router = useRouter();
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [composeForm, setComposeForm] = useState({ receiver_id: "", subject: "", body: "" });

    const handleSend = async () => {
        if (!composeForm.receiver_id || !composeForm.body) return;
        setLoading(true);
        await sendMessage(composeForm);
        setLoading(false);
        setIsComposeOpen(false);
        setComposeForm({ receiver_id: "", subject: "", body: "" });
        router.refresh();
    };

    const handleOpenMessage = async (msg: any) => {
        setSelectedMessage(msg);
        if (!msg.is_read && msg.receiver_id === currentUserId) {
            await markMessageRead(msg.id);
            router.refresh();
        }
    };

    const unreadCount = inbox.filter(m => !m.is_read).length;

    const renderMessageList = (messages: any[], type: "inbox" | "sent") => (
        <div className="divide-y divide-slate-100">
            {messages.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground font-medium">No messages yet.</div>
            ) : (
                messages.map((msg) => {
                    const person = type === "inbox" ? msg.sender : msg.receiver;
                    return (
                        <button
                            key={msg.id}
                            onClick={() => handleOpenMessage(msg)}
                            className={cn(
                                "w-full flex items-start gap-x-4 p-5 text-left transition-all hover:bg-white/60",
                                selectedMessage?.id === msg.id && "bg-white shadow-sm",
                                type === "inbox" && !msg.is_read && "bg-blue-50/50 border-l-4 border-blue-500"
                            )}
                        >
                            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0", type === "inbox" && !msg.is_read ? "bg-blue-500 neon-blue" : "bg-card")}>
                                {person?.first_name?.[0] || "?"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className={cn("text-sm truncate", type === "inbox" && !msg.is_read ? "font-black text-foreground" : "font-bold text-slate-700")}>
                                        {person?.first_name} {person?.last_name}
                                    </span>
                                    <span className="text-[10px] font-bold text-muted-foreground shrink-0 ml-2">
                                        {new Date(msg.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs font-bold text-foreground/70 truncate">{msg.subject || "(No subject)"}</p>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">{msg.body}</p>
                            </div>
                        </button>
                    );
                })
            )}
        </div>
    );

    return (
        <div className="h-[calc(100vh-160px)] flex gap-x-6 animate-in fade-in duration-700">
            {/* Message List Panel */}
            <Card className="w-96 border-none glass futuristic-card flex flex-col overflow-hidden">
                <CardHeader className="bg-card text-white p-5 shrink-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-x-2">
                            <MessageSquare className="h-4 w-4 text-blue-400" /> Messages
                        </CardTitle>
                        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="rounded-xl bg-blue-500 text-white font-bold gap-x-1 h-8 text-xs border-none">
                                    <Plus className="h-3 w-3" /> Compose
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="glass border-none">
                                <DialogHeader><DialogTitle className="font-black text-2xl">New Message</DialogTitle></DialogHeader>
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">To</Label>
                                        <Select value={composeForm.receiver_id} onValueChange={(v) => setComposeForm({ ...composeForm, receiver_id: v })}>
                                            <SelectTrigger><SelectValue placeholder="Select recipient" /></SelectTrigger>
                                            <SelectContent>
                                                {contacts.map(c => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.first_name} {c.last_name} ({c.role})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Subject</Label>
                                        <Input value={composeForm.subject} onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })} placeholder="Message subject" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold uppercase text-muted-foreground">Message</Label>
                                        <textarea
                                            value={composeForm.body}
                                            onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                                            placeholder="Type your message..."
                                            className="w-full h-32 rounded-xl border border-border p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
                                        />
                                    </div>
                                    <Button onClick={handleSend} disabled={loading} className="w-full rounded-xl py-6 bg-card text-white font-bold gap-x-2">
                                        <Send className="h-4 w-4" />
                                        {loading ? "Sending..." : "Send Message"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    {unreadCount > 0 && (
                        <Badge className="mt-2 bg-blue-500/20 text-blue-300 border-none text-[10px] font-bold w-fit">{unreadCount} Unread</Badge>
                    )}
                </CardHeader>
                <Tabs defaultValue="inbox" className="flex-1 flex flex-col overflow-hidden">
                    <TabsList className="bg-transparent h-auto p-2 gap-x-1 shrink-0">
                        <TabsTrigger value="inbox" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm gap-x-1">
                            <Inbox className="h-3 w-3" /> Inbox ({inbox.length})
                        </TabsTrigger>
                        <TabsTrigger value="sent" className="rounded-xl px-4 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm gap-x-1">
                            <SendHorizonal className="h-3 w-3" /> Sent ({sent.length})
                        </TabsTrigger>
                    </TabsList>
                    <ScrollArea className="flex-1">
                        <TabsContent value="inbox" className="m-0">{renderMessageList(inbox, "inbox")}</TabsContent>
                        <TabsContent value="sent" className="m-0">{renderMessageList(sent, "sent")}</TabsContent>
                    </ScrollArea>
                </Tabs>
            </Card>

            {/* Message Detail Panel */}
            <Card className="flex-1 border-none glass futuristic-card flex flex-col overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-20" />
                {selectedMessage ? (
                    <>
                        <div className="p-6 border-b border-border bg-white/40 backdrop-blur-sm shrink-0">
                            <div className="flex items-center gap-x-4">
                                <div className="h-12 w-12 rounded-2xl bg-card text-white flex items-center justify-center shadow-xl neon-blue font-black text-xl">
                                    {(selectedMessage.sender?.first_name || selectedMessage.receiver?.first_name)?.[0] || "?"}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-black text-foreground tracking-tight">
                                        {selectedMessage.sender?.first_name || selectedMessage.receiver?.first_name}{" "}
                                        {selectedMessage.sender?.last_name || selectedMessage.receiver?.last_name}
                                    </h3>
                                    <p className="text-xs font-bold text-muted-foreground">{selectedMessage.subject || "(No subject)"}</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="font-bold text-[10px]">
                                        {selectedMessage.sender?.role || selectedMessage.receiver?.role || "User"}
                                    </Badge>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                                        {new Date(selectedMessage.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <ScrollArea className="flex-1 p-8">
                            <div className="prose prose-sm max-w-none">
                                <p className="text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{selectedMessage.body}</p>
                            </div>
                        </ScrollArea>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <Mail className="h-16 w-16 mx-auto text-slate-200 mb-4" />
                            <h3 className="font-black text-lg text-slate-300">Select a message</h3>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Choose a message from the list to read</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

