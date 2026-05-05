"use client";

import { Suspense, lazy } from "react";
import { Badge } from "@/components/ui/badge";
import { Search, LogOut, User as UserIcon, Calendar as CalendarIcon, Clock, GraduationCap } from "lucide-react";
import { useEffect, useState, use } from "react";
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
        const profile = await UserService.getCurrentProfile();
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
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 relative overflow-hidden font-sans">
      {/* Background Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Navigation */}
      <header className="relative z-50 flex items-center justify-between px-8 py-6 page-fade-in">
        <div className="flex items-center gap-x-4">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight leading-none">
              Edu Maysan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-x-4">
          <div className="hidden lg:flex items-center gap-2 text-slate-500 text-xs font-medium uppercase">
            <div className="flex items-center gap-x-2 bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
              <CalendarIcon className="h-3 w-3" />
              {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase">
                    {userProfile?.first_name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 mt-2 rounded-sm p-2 border-border shadow-2xl backdrop-blur-xl bg-card/80" align="end">
              <DropdownMenuLabel className="p-4">
                <div className="flex flex-col gap-y-1">
                  <p className="text-sm font-bold text-foreground">{userProfile?.first_name} {userProfile?.last_name}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{userRole}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => router.push("/profile")}
                className="rounded-lg p-3 cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <UserIcon className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                <span className="font-bold text-slate-700 dark:text-slate-300">View Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="rounded-xs p-3 cursor-pointer group text-destructive focus:text-destructive">
                <LogOut className="mr-3 h-4 w-4" />
                <span className="font-bold">Exit System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-12 pb-24 page-fade-in">
        <div className="flex flex-col items-center text-center space-y-8 mb-20">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {getGreeting()}, {userProfile?.first_name}
            </h1>
            <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
              Select a module to manage your school activities and records.
            </p>
          </div>

          <div className="relative w-full max-w-xl mt-4 group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-all duration-300" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find a module..." 
              className="w-full pl-16 pr-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 soft-shadow-md focus:outline-none focus:border-slate-400 transition-all font-bold text-base text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium"
            />
          </div>
        </div>

        <div className="space-y-20 reveal-2">
          <Launchpad userRole={userRole} searchQuery={searchQuery} />
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 reveal-3">
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 dark:border-slate-800 soft-shadow-lg">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 flex items-center gap-x-2">
            Edu Maysan <span className="h-1 w-1 rounded-full bg-blue-500" /> Professional v4.5
          </p>
        </div>
      </footer>
    </div>

  );
}

