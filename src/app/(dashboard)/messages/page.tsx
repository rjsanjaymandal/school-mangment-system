"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Users,
  Shield,
  Zap,
  Search,
  MoreVertical,
  Mic,
  Paperclip,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const contacts = [
  {
    id: "1",
    name: "Dr. Aris",
    role: "Teacher",
    online: true,
    lastMsg: "The midterm grades are finalized.",
  },
  {
    id: "2",
    name: "Sophia Martinez",
    role: "Student",
    online: false,
    lastMsg: "Thank you for the feedback!",
  },
  {
    id: "3",
    name: "Institutional Admin",
    role: "Admin",
    online: true,
    lastMsg: "New policy updated in section 4.",
  },
];

export default function MessagesPage() {
  const [activeContact, setActiveContact] = useState(contacts[0]);
  const [msgInput, setMsgInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeContact]);

  return (
    <div className="h-[calc(100vh-160px)] flex gap-x-8 animate-in fade-in duration-700">
      {/* Contacts Sidebar */}
      <Card className="w-80 border-none glass futuristic-card flex flex-col overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-6">
          <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center justify-between">
            Direct Neural Links
            <Badge className="bg-blue-500 text-white border-none text-[8px] animate-pulse">
              SYNC ACTIVE
            </Badge>
          </CardTitle>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-2.5 h-3 w-3 text-slate-500" />
            <Input
              placeholder="Search neural nodes..."
              className="pl-9 h-9 bg-white/5 border-white/10 text-xs text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-blue-500"
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1 p-2">
          {contacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setActiveContact(contact)}
              className={cn(
                "w-full flex items-start gap-x-3 p-4 rounded-2xl transition-all duration-300 text-left mb-1",
                activeContact.id === contact.id
                  ? "bg-white shadow-lg border border-slate-100"
                  : "hover:bg-white/40",
              )}
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold neon-blue">
                  {contact.name[0]}
                </div>
                {contact.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-slate-900 text-xs truncate">
                    {contact.name}
                  </span>
                  <span className="text-[8px] font-bold text-slate-400 capitalize">
                    {contact.role}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 truncate">
                  {contact.lastMsg}
                </p>
              </div>
            </button>
          ))}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 border-none glass futuristic-card flex flex-col overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-blue-500 to-purple-500 opacity-20" />

        {/* Chat Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/40 backdrop-blur-sm">
          <div className="flex items-center gap-x-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-xl neon-blue font-black text-xl">
              {activeContact.name[0]}
            </div>
            <div>
              <h3 className="font-black text-slate-900 tracking-tight">
                {activeContact.name}
              </h3>
              <div className="flex items-center gap-x-1.5">
                <div
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    activeContact.online
                      ? "bg-green-500 animate-pulse"
                      : "bg-slate-300",
                  )}
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {activeContact.online ? "Encrypted Feed Active" : "Offline"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-x-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-white"
            >
              <Shield className="h-4 w-4 text-slate-400" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-white"
            >
              <MoreVertical className="h-4 w-4 text-slate-400" />
            </Button>
          </div>
        </div>

        {/* Messages Feed */}
        <ScrollArea className="flex-1 p-6" ref={scrollRef}>
          <div className="space-y-6">
            <div className="flex justify-center">
              <Badge
                variant="outline"
                className="bg-slate-100 text-slate-500 border-none font-black text-[8px] uppercase tracking-widest"
              >
                Yesterday
              </Badge>
            </div>

            <div className="flex items-end gap-x-3">
              <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                A
              </div>
              <div className="p-4 rounded-2xl rounded-bl-none bg-slate-100 text-slate-600 text-xs font-medium max-w-[70%] leading-relaxed">
                The assessment for Term 2 has been calibrated. Please review the
                institutional guidelines.
              </div>
            </div>

            <div className="flex flex-row-reverse items-end gap-x-3">
              <div className="h-8 w-8 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 text-xs font-bold shadow-lg neon-blue">
                U
              </div>
              <div className="p-4 rounded-2xl rounded-br-none bg-slate-900 text-white text-xs font-medium max-w-[70%] leading-relaxed shadow-xl">
                Acknowledged. I will update the faculty nodes accordingly.
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 bg-white/40 backdrop-blur-md border-t border-slate-100">
          <div className="flex items-center gap-x-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Neural ping..."
                value={msgInput}
                onChange={(e) => setMsgInput(e.target.value)}
                className="bg-white border-slate-100 rounded-2xl h-14 pl-6 pr-24 shadow-sm focus-visible:ring-blue-500 font-medium"
              />
              <div className="absolute right-2 top-2 flex items-center gap-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-slate-400 hover:text-slate-900"
                >
                  <Mic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl text-slate-400 hover:text-slate-900"
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-2xl neon-blue hover:scale-105 transition-transform">
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
