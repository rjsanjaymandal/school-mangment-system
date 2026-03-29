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
        <Button variant="ghost" size="icon" className="relative group rounded-lg border border-transparent hover:border-border hover:bg-secondary transition-all">
          <Bell className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-primary rounded-full border-2 border-card" />
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
            <DropdownMenuItem className="p-2.5 rounded-md cursor-pointer group">
              <span className="font-medium text-foreground">View Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="p-2.5 rounded-md cursor-pointer group">
              <span className="font-medium text-foreground">Settings</span>
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

