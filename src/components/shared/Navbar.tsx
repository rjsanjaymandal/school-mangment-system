"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { cn } from "@/lib/utils";

import { User } from "@supabase/supabase-js";
import { 
  Grid3X3, Sun, Moon, Settings, LogOut, 
  Search, Home, Bell, MoonIcon, Menu
} from "lucide-react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useTheme } from "@/lib/providers/ThemeProvider";
import { LiveCollectionPill } from "@/components/finance/LiveCollectionPill";
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
import { Badge } from "@/components/ui/badge";

interface NavbarProps {
  user: User | null;
  userRole?: string | null;
}

export function Navbar({ user, userRole }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const role = userRole || "student";
  const { theme, toggleTheme } = useTheme();
  const { isCollapsed, width, toggle } = useSidebarStore();
  
  const handleSignOut = async () => {
    const { createClient } = await import("@/lib/supabase/client");
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
    "launcher": "Launchpad",
    "academics": "Academics",
    "services": "Services"
  };

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = labelMapping[segment.toLowerCase()] || 
                  (segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));
    return { label, href: index < pathSegments.length - 1 ? href : undefined };
  });

  const [mounted, setMounted] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const sidebarWidth = mounted ? (isCollapsed ? 80 : width) : 256;

  return (
    <header 
      className={cn(
        "h-16 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 fixed top-0 right-0 z-50 shadow-sm",
        "transition-all duration-300"
      )}
      style={{ left: sidebarWidth }}
    >
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-lg md:hidden"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Link href="/" className="flex items-center gap-3 md:hidden">
          <div className="h-9 w-9 rounded-full overflow-hidden shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-500/30">
            <Image 
              src="/icon-rounded-v2.png" 
              alt="Edu Maysan" 
              width={36}
              height={36}
              className="object-cover rounded-full"
            />
          </div>
          <span className="font-bold text-slate-900">Edu Maysan</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1.5 text-sm">
          <Link href="/" className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-slate-300">/</span>
              {crumb.href ? (
                <Link href={crumb.href} className="text-slate-500 hover:text-slate-800 font-medium px-1.5 py-1 rounded-md hover:bg-slate-100 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-800 font-medium px-1.5 py-1 bg-slate-100 rounded-md">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden xl:flex items-center">
          <LiveCollectionPill />
        </div>

        <div className="h-5 w-px bg-slate-200 hidden md:block" />

        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push("/launcher")} 
            className="h-9 w-9 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="h-9 w-9 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {theme === "light" ? <MoonIcon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          <div className="hidden sm:block">
            <NotificationBell />
          </div>
        </div>

        <div className="h-5 w-px bg-slate-200 hidden md:block" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <div className="relative">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={user?.email || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-900 truncate max-w-[120px]">
                  {user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User"}
                </p>
                <Badge variant="outline" className="text-[10px] px-1 py-0 capitalize">{role}</Badge>
              </div>
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent className="w-64 mt-2 rounded-xl p-2 border border-slate-200/80 bg-white shadow-xl shadow-slate-200/20" align="end" sideOffset={8}>
            <DropdownMenuLabel className="p-3 bg-slate-50 rounded-lg mb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {user?.user_metadata?.full_name || "User"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            
            <DropdownMenuItem className="rounded-lg p-2.5 cursor-pointer hover:bg-slate-50" onClick={() => router.push("/profile")}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                  <Settings className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium">My Profile</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuItem className="rounded-lg p-2.5 cursor-pointer hover:bg-slate-50" onClick={() => router.push("/settings")}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                  <Settings className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium">Settings</span>
              </div>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-slate-100" />
            
            <DropdownMenuItem className="rounded-lg p-2.5 cursor-pointer hover:bg-rose-50 text-rose-600" onClick={handleSignOut}>
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-rose-100 text-rose-600">
                  <LogOut className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-medium">Sign Out</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}