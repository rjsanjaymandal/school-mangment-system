"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";

import { User } from "@supabase/supabase-js";
import { Grid3X3, Sun, Moon, Sparkles, Command, Settings, LogOut } from "lucide-react";
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
        "h-16 border-b border-slate-200/60 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 fixed top-0 right-0 z-50",
        isResizing ? "transition-none" : "transition-all duration-300"
      )}
      style={{ left: !mounted ? 256 : (isCollapsed ? 80 : width) }}
    >
      <div className="flex-1 overflow-hidden">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
            <Breadcrumb items={breadcrumbs} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400" />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 pr-2">
            <LiveCollectionPill />
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-emerald-600 transition-all active:scale-95"
                onClick={() => router.push("/launcher")}
                title="Application Launchpad"
            >
                <Grid3X3 className="h-5 w-5" />
            </Button>
            
            <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-all active:scale-95"
                onClick={toggleTheme}
                title={theme === "light" ? "Activate Night Mode" : "Activate Daylight Mode"}
            >
                {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        <div className="flex items-center gap-4">
            <GlobalSearch />
            <NotificationBell />
            
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 w-10 p-0 rounded-xl overflow-hidden ring-1 ring-slate-200 hover:ring-slate-300 transition-all shadow-sm">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt="Personnel" />
                        <AvatarFallback className="bg-slate-900 text-white text-[10px] font-black uppercase">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-2 rounded-2xl p-2 border-none shadow-2xl backdrop-blur-xl bg-white/95" align="end" sideOffset={4}>
                <DropdownMenuLabel className="p-4">
                    <div className="flex flex-col gap-y-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">User Account</p>
                        <p className="text-sm font-black text-slate-900 truncate leading-none">
                        {user?.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem className="rounded-xl p-3 font-bold text-slate-600 hover:text-slate-900 cursor-pointer" onClick={() => router.push("/profile")}>
                    <Command className="h-4 w-4 mr-3 opacity-50" />
                    My Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="rounded-xl p-3 font-bold text-slate-600 hover:text-slate-900 cursor-pointer" onClick={() => router.push("/settings")}>
                    <Settings className="h-4 w-4 mr-3 opacity-50" />
                    Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100" />
                <DropdownMenuItem
                className="rounded-xl p-3 font-black uppercase text-[10px] tracking-widest text-rose-600 hover:bg-rose-50 cursor-pointer"
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