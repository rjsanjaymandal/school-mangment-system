"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";

import { User } from "@supabase/supabase-js";
import { Grid3X3, Sun, Moon, Command, Settings, LogOut, Compass, Sparkles } from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useTheme } from "@/lib/providers/ThemeProvider";
import { LiveCollectionPill } from "@/components/finance/LiveCollectionPill";
import { GlobalSearch } from "@/components/search/GlobalSearch";
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
import { Breadcrumb } from "@/components/ui/breadcrumb";

interface NavbarProps {
  user: User | null;
  userRole?: string | null;
}

export function Navbar({ user, userRole }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const role = userRole || "student";
  const { theme, toggleTheme } = useTheme();
  
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const labelMapping: Record<string, string> = {
    "hr": "HR",
    "students": "Students",
    "list": "Student List",
    "directory": "Staff Directory",
    "enroll": "Enrollment",
    "attendance": "Attendance",
    "conduct": "Behavior",
    "finance": "Finance",
    "launcher": "Launchpad"
  };

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = labelMapping[segment.toLowerCase()] || 
                  (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));
    return {
      label,
      href: index < pathSegments.length - 1 ? href : undefined,
    };
  });

  const { isCollapsed, width } = useSidebarStore();
  const [mounted, setMounted] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleMouseDown = (e: MouseEvent) => {
      if (e.clientX >= width - 10 && e.clientX <= width + 10) {
        setIsResizing(true);
      }
    };
    const handleMouseUp = () => setIsResizing(false);

    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [width]);

  return (
    <header 
      className={cn(
        "h-16 border-b border-slate-200/50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-8 fixed top-0 right-0 z-50 shadow-[0_2px_15px_-4px_rgba(0,0,0,0.02)] transition-colors duration-300",
        isResizing ? "transition-none" : "transition-all duration-300"
      )}
      style={{ left: !mounted ? 256 : (isCollapsed ? 80 : width) }}
    >
      {/* Left Area: Sleek Breadcrumb Pill */}
      <div className="flex-1 overflow-hidden flex items-center gap-2">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/40 px-3.5 py-1.5 rounded-full shadow-inner-sm max-w-full overflow-x-auto no-scrollbar animate-in fade-in slide-in-from-left-4 duration-500">
          <Compass className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
          <Breadcrumb 
            items={breadcrumbs} 
            className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500" 
          />
        </div>
      </div>

      {/* Right Area: Control Panel Cockpit */}
      <div className="flex items-center gap-6">
        <div className="hidden lg:flex items-center gap-2 pr-2 animate-in fade-in duration-700">
          <LiveCollectionPill />
        </div>

        <div className="h-6 w-px bg-slate-200/80 dark:bg-slate-800/80 hidden lg:block" />

        {/* Dynamic Glass Tools Capsule */}
        <div className="flex items-center gap-1.5 bg-slate-50/80 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30 p-1.5 rounded-2xl shadow-inner-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-800/80 text-slate-400 hover:text-emerald-500 transition-all active:scale-95 duration-200 hover:shadow-sm"
            onClick={() => router.push("/launcher")}
            title="Launchpad"
          >
            <Grid3X3 className="h-4.5 w-4.5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-xl hover:bg-white dark:hover:bg-slate-800/80 text-slate-400 hover:text-blue-500 transition-all active:scale-95 duration-200 hover:shadow-sm"
            onClick={toggleTheme}
            title={theme === "light" ? "Night Mode" : "Daylight Mode"}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <div className="h-4 w-px bg-slate-200/60 dark:bg-slate-800/60 mx-1" />

          <div className="flex items-center gap-2">
            <GlobalSearch />
            <NotificationBell />
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200/80 dark:bg-slate-800/80" />

        {/* User Account Trigger with Active Glowing Ring */}
        <div className="flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="relative flex items-center justify-center p-0.5 rounded-2xl transition-all duration-300 hover:ring-2 hover:ring-emerald-500/20 active:scale-95 focus:outline-none">
                <Avatar className="h-9 w-9 rounded-xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
                  <AvatarImage src="" alt="Personnel" />
                  <AvatarFallback className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-black uppercase leading-none">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* Active Sync Breathing State Indicator */}
                <span className="absolute bottom-0.5 right-0.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
              className="w-68 mt-2 rounded-2xl p-2 border border-slate-200/40 dark:border-slate-800/40 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-950/95" 
              align="end" 
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-4">
                <div className="flex flex-col gap-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Identity Desk</p>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                      {role}
                    </span>
                  </div>
                  <p className="text-sm font-black text-slate-900 dark:text-slate-100 truncate leading-none mt-1">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100/80 dark:bg-slate-800/80" />
              
              <DropdownMenuItem 
                className="rounded-xl p-3 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-900 transition-colors" 
                onClick={() => router.push("/profile")}
              >
                <Command className="h-4 w-4 mr-3 opacity-50 text-slate-500" />
                My Profile
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                className="rounded-xl p-3 font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-900 transition-colors" 
                onClick={() => router.push("/settings")}
              >
                <Settings className="h-4 w-4 mr-3 opacity-50 text-slate-500" />
                Settings
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-slate-100/80 dark:bg-slate-800/80" />
              
              <DropdownMenuItem
                className="rounded-xl p-3 font-black uppercase text-[9px] tracking-[0.2em] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer focus:bg-rose-50 dark:focus:bg-rose-950/20 transition-colors"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Terminate Session
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}