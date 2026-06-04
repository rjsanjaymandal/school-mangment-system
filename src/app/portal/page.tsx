"use client";

import { Suspense, lazy } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, LogOut, User as UserIcon, GraduationCap, ShieldCheck, IndianRupee, BookOpen, ClipboardCheck, Calendar, MessageSquare, Users, Library, Bus, Heart, Clock, BookMarked, Monitor, Wallet, LayoutDashboard, Settings, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { UserService } from "@/lib/services/user";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const Launchpad = lazy(() => import("@/components/shared/Launchpad").then(m => ({ default: m.Launchpad })));

const quickLinks = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, color: "text-emerald-400 bg-emerald-500/10" },
  { label: "Students", href: "/students", icon: GraduationCap, color: "text-blue-400 bg-blue-500/10" },
  { label: "Attendance", href: "/students/attendance", icon: ClipboardCheck, color: "text-amber-400 bg-amber-500/10" },
  { label: "Fees", href: "/finance/dashboard", icon: IndianRupee, color: "text-purple-400 bg-purple-500/10" },
  { label: "Timetable", href: "/academics/timetable", icon: Calendar, color: "text-rose-400 bg-rose-500/10" },
  { label: "Messages", href: "/messages", icon: MessageSquare, color: "text-cyan-400 bg-cyan-500/10" },
  { label: "Library", href: "/services/library", icon: Library, color: "text-indigo-400 bg-indigo-500/10" },
  { label: "Transport", href: "/services/transport", icon: Bus, color: "text-orange-400 bg-orange-500/10" },
];

const roleHref: Record<string, string> = {
  admin: "/",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
  parent: "/parent/dashboard",
  accountant: "/finance/dashboard",
};

export default function PortalPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const profile = await UserService.getCurrentProfile(supabase);
        if (cancelled) return;
        if (profile && !("error" in profile)) setUserProfile(profile);
        else router.push("/login");
      } catch {
        if (!cancelled) router.push("/login");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchProfile();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [router]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-pulse h-8 w-48 rounded-full bg-white/5" />
          <div className="animate-pulse h-12 w-72 rounded-xl bg-white/5" />
        </div>
      </div>
    );
  }

  const userRole = userProfile?.role || "student";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 font-sans">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/8 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[-15%] left-[-5%] w-[50%] h-[50%] bg-blue-500/8 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "12s" }} />
      </div>

      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <Image src="/logo-rounded-v2.png" alt="Edu Maysan" width={140} height={40} className="object-contain h-8 w-auto" priority />

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-xl border border-white/10">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-xs font-semibold text-white">{currentTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
            <span className="text-[10px] text-white/40">{currentTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors">
                <div className="relative">
                  {userProfile?.avatar_url ? (
                    <Avatar className="h-9 w-9 rounded-xl ring-2 ring-emerald-500/20">
                      <AvatarImage src={userProfile.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs">
                        {userProfile?.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-emerald-500/20">
                      {userProfile?.full_name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </div>
                <span className="hidden md:block text-sm font-bold text-white">{userProfile?.full_name || "User"}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl p-2 border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-2xl" align="end" sideOffset={8}>
              <DropdownMenuLabel className="p-3 bg-white/5 rounded-xl mb-2">
                <p className="text-sm font-bold text-white">{userProfile?.full_name || "User"}</p>
                <p className="text-xs text-white/50 truncate">{userProfile?.email || ""}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="rounded-xl p-2.5 cursor-pointer hover:bg-white/5 text-white/80" onClick={() => router.push("/profile")}>
                <UserIcon className="h-4 w-4 mr-2 text-blue-400" /> <span className="text-sm font-semibold">My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-xl p-2.5 cursor-pointer hover:bg-white/5 text-white/80" onClick={() => router.push("/settings")}>
                <Settings className="h-4 w-4 mr-2 text-white/50" /> <span className="text-sm font-semibold">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem className="rounded-xl p-2.5 cursor-pointer hover:bg-rose-500/10 text-rose-400" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> <span className="text-sm font-semibold">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pb-36">
        {/* Hero + Search row */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.1]">
              {getGreeting()},{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                {userProfile?.full_name?.split(" ")[0] || "User"}
              </span>
            </h1>
            <p className="text-sm text-white/50 mt-2 max-w-lg">
              Your role: <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-widest">{userRole}</span>
              {roleHref[userRole] && (
                <Link href={roleHref[userRole]} className="inline-flex items-center gap-1 ml-3 text-[10px] font-bold uppercase tracking-widest text-white/30 hover:text-emerald-400 transition-colors">
                  Go to Dashboard <ChevronRight className="h-3 w-3" />
                </Link>
              )}
            </p>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules..."
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-sm text-white placeholder:text-white/30"
            />
          </div>
        </div>

        {/* Quick Access */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
          {quickLinks.map((link, i) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.label}
                href={link.href}
                className="group flex items-center gap-3 p-4 rounded-2xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.06] hover:border-emerald-500/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                style={{ animationDelay: `${200 + i * 60}ms` }}
              >
                <div className={cn("p-2.5 rounded-xl shrink-0", link.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm font-bold text-white/80 group-hover:text-white transition-colors">{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Launchpad Modules */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <Suspense fallback={
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <div key={i} className="animate-pulse h-32 rounded-2xl bg-white/5" />)}
            </div>
          }>
            <Launchpad userRole={userRole} searchQuery={searchQuery} />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image src="/logo-rounded-v2.png" alt="Edu Maysan" width={80} height={24} className="object-contain h-4 w-auto opacity-40" />
                <div className="h-3 w-px bg-white/10" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">Edu Maysan</span>
              </div>
              <div className="flex items-center gap-3 text-[9px] font-bold text-white/20 tracking-[0.15em]">
                <Heart className="h-3 w-3 text-emerald-400/50" />
                <span>Built with care</span>
                <span className="text-white/10">|</span>
                <span>&copy; {currentTime.getFullYear()}</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}