"use client";

import { Launchpad } from "@/components/shared/Launchpad";
import { Badge } from "@/components/ui/badge";
import { Search, LogOut, User as UserIcon, Calendar as CalendarIcon, Clock } from "lucide-react";
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

export default function LauncherPage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await UserService.getCurrentProfile();
        if (profile && !("error" in profile)) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
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
              <SkeletonLoader key={i} className="h-40 rounded-[2rem]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userRole = userProfile?.role || "student";

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/40 dark:bg-blue-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/40 dark:bg-purple-900/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Top Navigation / Status Header */}
      <header className="relative z-50 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-x-4">
          <div className="bg-slate-900 text-white p-2.5 rounded-2xl shadow-xl neon-blue">
            <span className="font-black text-xl tracking-tighter">EM</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Edu Maysan</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">School System</span>
          </div>
        </div>

        <div className="flex items-center gap-x-6">
          <div className="hidden lg:flex items-center gap-x-6 text-slate-500 font-bold text-xs uppercase tracking-widest">
            <div className="flex items-center gap-x-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <CalendarIcon className="h-3 w-3" />
              {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-x-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
              <Clock className="h-3 w-3" />
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-2xl p-0 hover:bg-white dark:hover:bg-slate-900 shadow-sm border border-white/20">
                <Avatar className="h-10 w-10 rounded-xl">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-slate-900 text-white font-bold text-xs uppercase">
                    {userProfile?.first_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-2 rounded-[1.5rem] p-2 border-white/20 shadow-2xl backdrop-blur-xl bg-white/80 dark:bg-slate-900/80" align="end">
              <DropdownMenuLabel className="p-4">
                <div className="flex flex-col gap-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{userProfile?.first_name} {userProfile?.last_name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{userRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem className="rounded-xl p-3 cursor-pointer group">
                <UserIcon className="mr-3 h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="font-bold text-slate-600 dark:text-slate-300">Personal Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
              <DropdownMenuItem onClick={handleSignOut} className="rounded-xl p-3 cursor-pointer group text-red-600 focus:text-red-700">
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-bold">Exit System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Command Center Hub */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-24">
        <div className="flex flex-col items-center text-center space-y-6 mb-16">
          <div className="inline-flex items-center gap-x-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
            <Badge variant="outline" className="border-none text-[10px] font-black uppercase tracking-[0.2em] p-0">
              Session Active
            </Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black tracking-tightest text-slate-950 dark:text-white leading-[1.1]">
            {getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">{userProfile?.first_name}</span>.
          </h1>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl">
            Welcome to your <span className="text-slate-900 dark:text-slate-200 font-bold">School Portal</span>. Access all your school apps and records from one place.
          </p>

          <div className="relative w-full max-w-2xl group mt-4">
            <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] blur-xl group-focus-within:bg-blue-500/10 transition-all duration-500" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-all duration-300" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search modules, analytics, or personnel..." 
              className="w-full pl-16 pr-8 py-6 rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-slate-800 shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:bg-white dark:focus:bg-slate-900 transition-all font-bold text-lg text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
        </div>

        <div className="space-y-20">
          <Launchpad userRole={userRole} searchQuery={searchQuery} />
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-full shadow-lg">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-x-2">
            Maysan Labs <span className="h-1 w-1 rounded-full bg-slate-300 uppercase" /> School Management System v2.5.0
          </p>
        </div>
      </footer>
    </div>
  );
}
