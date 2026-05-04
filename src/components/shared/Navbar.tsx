"use client";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

import { User } from "@supabase/supabase-js";
import { Bell, Search } from "lucide-react";
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
    <div className="h-16 border-b border-border bg-card flex items-center px-6 justify-between gap-x-4">
      <div className="flex-1 max-w-lg relative group">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          placeholder="Search records..."
          className="pl-9 bg-secondary border-border rounded-lg transition-all focus-visible:ring-1 focus-visible:ring-primary font-medium"
        />
      </div>
      <div className="flex items-center gap-x-4">
        <Button variant="ghost" size="icon" className="relative group rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
          <Bell className="h-4 w-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-lg p-0 border border-border overflow-hidden"
            >
              <Avatar className="h-9 w-9 rounded-none">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs uppercase">
                  {user?.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 mt-2 rounded-lg border-border bg-card shadow-lg" align="end" forceMount>
            <DropdownMenuLabel className="p-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold tracking-tight">Account Settings</p>
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
             <DropdownMenuItem className="p-2.5 rounded-md cursor-pointer group" onClick={() => router.push("/profile")}>
              <span className="font-medium text-slate-700 dark:text-slate-300">View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-2.5 rounded-md cursor-pointer group" onClick={() => router.push("/settings")}>
              <span className="font-medium text-slate-700 dark:text-slate-300">Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive font-semibold p-2.5 rounded-md cursor-pointer focus:text-destructive"
              onClick={handleSignOut}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

