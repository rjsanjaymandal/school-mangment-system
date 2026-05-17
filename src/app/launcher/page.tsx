"use client";

// Force refresh
import { Suspense, lazy } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, LogOut, User as UserIcon, Calendar as CalendarIcon, Clock, GraduationCap, Sparkles, Activity, ShieldCheck, HeartPulse, IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";
import { UserService } from "@/lib/services/user";
import { SkeletonLoader } from "@/components/shared/SkeletonLoader";
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
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Lazy load Launchpad for faster initial render
const Launchpad = lazy(() => import("@/components/shared/Launchpad").then(m => ({ default: m.Launchpad })));

export default function LauncherPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const supabase = createClient();
        const profile = await UserService.getCurrentProfile(supabase);
        if (profile && !("error" in profile)) {
          setUserProfile(profile);
        } else {
          router.push("/login");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-full max-w-6xl px-4 space-y-10">
          <div className="flex flex-col items-center space-y-4">
            <SkeletonLoader className="h-8 w-48 rounded-full" />
            <SkeletonLoader className="h-16 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonLoader key={i} className="h-40 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userRole = userProfile?.role || "student";

  return (
    <div className="min-h-screen bg-[#fafbfc] dark:bg-slate-950 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse duration-[10s]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse duration-[15s]" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-50 flex items-center justify-between px-10 py-8 animate-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-x-5">
          <div className="h-12 w-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-slate-900/10">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-1">
              Edu Maysan
            </span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Institutional OS</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-x-6">
          <div className="hidden xl:flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-2xl p-0 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all active:scale-95">
                <Avatar className="h-10 w-10 rounded-xl">
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs uppercase">
                    {userProfile?.first_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-72 mt-3 rounded-2xl p-3 border-none shadow-2xl backdrop-blur-2xl bg-white/90 dark:bg-slate-950/90" align="end">
              <DropdownMenuLabel className="p-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-black text-lg">
                        {userProfile?.first_name?.[0]}
                    </div>
                    <div className="flex flex-col">
                        <p className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{userProfile?.first_name} {userProfile?.last_name}</p>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">{userRole}</p>
                    </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem 
                onClick={() => router.push("/profile")}
                className="rounded-xl p-3 mt-2 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <UserIcon className="mr-3 h-4 w-4 opacity-50 group-hover:opacity-100" />
                <span>Personnel Dossier</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push("/settings")}
                className="rounded-xl p-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-900 transition-all font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <Activity className="mr-3 h-4 w-4 opacity-50 group-hover:opacity-100" />
                <span>System Console</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 mb-1 cursor-pointer group text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition-all font-black uppercase text-[10px] tracking-widest">
                <LogOut className="mr-3 h-4 w-4" />
                <span>Terminate Session</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="relative z-10 max-w-7xl mx-auto px-10 pt-8 pb-32">
        
        {/* Welcome Section */}
        <div className="grid lg:grid-cols-12 gap-12 mb-20 items-end">
            <div className="lg:col-span-8 space-y-6 animate-in slide-in-from-left-8 duration-1000">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="px-3 py-1 rounded-full border-emerald-200 text-emerald-600 bg-emerald-50/50 backdrop-blur-sm font-black text-[9px] uppercase tracking-widest">
                        <Sparkles className="h-3 w-3 mr-1.5" /> Institutional Access Granted
                    </Badge>
                </div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-[0.95]">
                    {getGreeting()}, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-emerald-600 to-slate-900 dark:from-white dark:via-emerald-400 dark:to-white">
                        {userProfile?.first_name}
                    </span>
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl leading-relaxed">
                    Welcome back. Select a module below to manage your school activities.
                </p>

                <div className="relative w-full max-w-2xl group pt-4">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-700" />
                    <Search className="absolute left-6 top-[calc(50%+8px)] -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors duration-300 z-10" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search modules, features, or records..." 
                        className="relative w-full pl-16 pr-8 py-5 rounded-2xl bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-bold text-base text-slate-900 dark:text-white placeholder:text-slate-400 z-10"
                    />
                </div>
            </div>

            <div className="lg:col-span-4 space-y-6 animate-in slide-in-from-right-8 duration-1000">
                <div className="glass futuristic-card p-6 rounded-3xl border-none shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/50">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
                        <Activity className="h-3 w-3 text-emerald-500" /> System Status
                    </h3>
                    <div className="space-y-5">
                        <div className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <GraduationCap className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Active Students</span>
                            </div>
                            <span className="text-sm font-black text-slate-900 dark:text-white">Online</span>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">System Security</span>
                            </div>
                            <Badge className="bg-emerald-500 text-[9px] font-black uppercase tracking-widest border-none">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between group cursor-pointer">
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <IndianRupee className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Today's Fees</span>
                            </div>
                            <span className="text-sm font-black text-emerald-600">Updated</span>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <Button className="w-full h-11 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase text-[10px] tracking-[0.2em] shadow-lg hover:scale-[1.02] active:scale-95 transition-all">
                            View Reports
                        </Button>
                    </div>
                </div>
            </div>
        </div>

        {/* Modules Grid */}
        <div className="animate-in slide-in-from-bottom-8 duration-1000 delay-300">
          <Launchpad userRole={userRole} searchQuery={searchQuery} />
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-1000 delay-700">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-8 py-3 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none flex items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-x-3">
            Edu Maysan <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Enterprise v4.8
          </p>
        </div>
      </footer>
    </div>
  );
}
