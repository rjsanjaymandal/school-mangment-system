"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import { User } from "@supabase/supabase-js";
import { Bell, Search, Command } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Navbar({ user }: { user: User | null }) {
  const router = useRouter();
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="h-20 border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl flex items-center px-10 justify-between gap-x-8 sticky top-0 z-30">
      <div className="flex-1 max-w-xl relative group">
        <Search className="h-4 w-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <Input
          placeholder="Neural Search (Cmd + K)"
          className="h-12 pl-12 pr-12 bg-slate-50 dark:bg-slate-900 border-transparent rounded-2xl transition-all focus-visible:ring-2 focus-visible:ring-blue-500/20 font-bold text-sm"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <Command className="h-3 w-3 text-slate-400" />
          <span className="text-[10px] font-bold text-slate-400">K</span>
        </div>
      </div>
      
      <div className="flex items-center gap-x-6">
        <Button variant="ghost" size="icon" className="relative group h-12 w-12 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <Bell className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
          <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-12 w-12 rounded-2xl p-0 border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Avatar className="h-12 w-12 rounded-none">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-xs uppercase">
                  {user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 mt-4 p-3 rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl" align="end" forceMount>
            <DropdownMenuLabel className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl mb-2">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Identity Profile</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-2" />
             <DropdownMenuItem className="p-3 rounded-xl cursor-pointer font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => router.push("/profile")}>
              View System Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="p-3 rounded-xl cursor-pointer font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => router.push("/settings")}>
              Interface Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-2" />
            <DropdownMenuItem
              className="p-3 rounded-xl cursor-pointer font-bold text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              onClick={handleSignOut}
            >
              Terminate Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

