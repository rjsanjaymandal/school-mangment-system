"use client";

// Force refresh
import { Suspense, lazy } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Search, LogOut, User as UserIcon, GraduationCap, Sparkles, Activity, ShieldCheck, IndianRupee } from "lucide-react";
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
      <header className="relative z-50 flex items-center justify-between px-10 py-6 animate-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center gap-x-4">
          <div className="h-11 w-11 rounded-full overflow-hidden shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/30">
            <Image 
              src="/icon-rounded-v2.png" 
              alt="Edu Maysan" 
              width={44}
              height={44}
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">
              Edu Maysan
            </span>
            <div className="flex items-center gap-1.5">
              <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-slate-400">School Management</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-sm font-semibold text-slate-900 dark:text-white leading-none">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
              <span className="text-[10px] text-slate-400 leading-none">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden xl:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="relative">
                  {userProfile?.avatar_url ? (
                    <Avatar className="h-9 w-9 rounded-lg">
                      <AvatarImage src={userProfile.avatar_url} alt={userProfile?.full_name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                        {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-950" />
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {userProfile?.full_name || "User"}
                  </p>
                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 capitalize">{userRole}</Badge>
                </div>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-64 mt-2 rounded-xl p-2 border border-slate-200/80 bg-white shadow-xl shadow-slate-200/20" align="end" sideOffset={8}>
              <DropdownMenuLabel className="p-3 bg-slate-50 rounded-lg mb-2">
                <div className="flex items-center gap-3">
                  {userProfile?.avatar_url ? (
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage src={userProfile.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                        {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {userProfile?.full_name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{userProfile?.email || userProfile?.user_email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-100" />
              
              <DropdownMenuItem className="rounded-lg p-2.5 cursor-pointer hover:bg-slate-50" onClick={() => router.push("/profile")}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-100 text-blue-600">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-medium">My Profile</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="rounded-lg p-2.5 cursor-pointer hover:bg-slate-50" onClick={() => router.push("/settings")}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-slate-100 text-slate-600">
                    <Activity className="h-3.5 w-3.5" />
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

      {/* Main Content Hub */}
      <main className="relative z-10 max-w-7xl mx-auto px-10 pt-6 pb-32">
        
        {/* Welcome Section */}
        <div className="grid lg:grid-cols-12 gap-10 mb-16 items-end">
            <div className="lg:col-span-8 space-y-5 animate-in slide-in-from-left-8 duration-1000">
                <div className="flex items-center gap-2.5">
                    <Badge variant="outline" className="px-3 py-1 rounded-full border-emerald-200 text-emerald-600 bg-emerald-50/50 font-semibold text-[10px] uppercase tracking-wider">
                        <Sparkles className="h-3 w-3 mr-1.5" /> Access Granted
                    </Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                    {getGreeting()}, <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-emerald-600 to-slate-900 dark:from-white dark:via-emerald-400 dark:to-white">
                        {userProfile?.full_name?.split(' ')[0] || userProfile?.first_name || "User"}
                    </span>
                </h1>
                <p className="text-base text-slate-500 dark:text-slate-400 font-medium max-w-xl">
                    Welcome back. Select a module below to manage your school activities.
                </p>

                <div className="relative w-full max-w-xl group pt-2">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search modules, features, or records..." 
                        className="relative w-full pl-14 pr-5 py-4 rounded-xl bg-white dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all font-medium text-sm text-slate-900 dark:text-white placeholder:text-slate-400 z-10"
                    />
                </div>
            </div>

            <div className="lg:col-span-4 space-y-4 animate-in slide-in-from-right-8 duration-1000">
                <div className="glass futuristic-card p-5 rounded-2xl bg-white/80 dark:bg-slate-900/50">
                    <h3 className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-400 mb-4 flex items-center gap-2">
                        <Activity className="h-3 w-3 text-emerald-500" /> System Status
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <GraduationCap className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Students</span>
                            </div>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white">Online</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <ShieldCheck className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Security</span>
                            </div>
                            <Badge className="bg-emerald-500 text-[9px] font-semibold border-none">Active</Badge>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                            <div className="flex items-center gap-2.5">
                                <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                    <IndianRupee className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Fees</span>
                            </div>
                            <span className="text-xs font-semibold text-emerald-600">Updated</span>
                        </div>
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
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in duration-1000 delay-700">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl px-6 py-2 rounded-full border border-slate-200 dark:border-slate-800 shadow-lg flex items-center gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            Edu Maysan <span className="h-1 w-1 rounded-full bg-emerald-500" /> v4.8
          </p>
        </div>
      </footer>
    </div>
  );
}