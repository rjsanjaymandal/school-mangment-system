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
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[120px]" />
      </div>

      {/* Top Navigation / Status Header */}
      <header className="relative z-50 flex items-center justify-between px-8 py-6 reveal-0">
        <div className="flex items-center gap-x-4">
          <div className="bg-primary text-primary-foreground p-2.5 rounded-sm shadow-xl emerald-glow">
            <span className="font-black text-xl tracking-tighter">EM</span>
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-sm font-bold text-foreground leading-tight">Edu Maysan</span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">School System</span>
          </div>
        </div>

        <div className="flex items-center gap-x-6">
          <div className="hidden lg:flex items-center gap-x-6 text-foreground/90 font-bold text-xs uppercase tracking-widest">
            <div className="flex items-center gap-x-2 glass-dark px-4 py-2 rounded-sm border border-border bg-card/40">
              <CalendarIcon className="h-3 w-3 text-primary" />
              {currentTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-x-2 glass-dark px-4 py-2 rounded-sm border border-border bg-card/40">
              <Clock className="h-3 w-3 text-primary" />
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-12 w-12 rounded-sm p-0 hover:bg-accent shadow-sm border border-border">
                <Avatar className="h-10 w-10 rounded-xs">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs uppercase">
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
              <DropdownMenuItem className="rounded-xs p-3 cursor-pointer group">
                <UserIcon className="mr-3 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="font-bold text-foreground">Personal Profile</span>
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

      {/* Main Command Center Hub */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-10 pb-24">
        <div className="flex flex-col items-center text-center space-y-6 mb-16 reveal-1">
          <div className="inline-flex items-center gap-x-2 px-4 py-1.5 rounded-sm bg-primary/10 text-primary border border-primary/20">
            <Badge variant="outline" className="border-none text-[10px] font-black uppercase tracking-[0.2em] p-0">
              System Online
            </Badge>
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-black tracking-tightest text-foreground leading-[1.1] text-balance">
            {getGreeting()}, <span className="text-primary">{userProfile?.first_name}</span>.
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 font-medium max-w-2xl text-balance">
            Command your <span className="text-foreground font-bold underline decoration-primary underline-offset-8">School Ecosystem</span>. Integrated management for the modern institution.
          </p>

          <div className="relative w-full max-w-2xl group mt-4">
            <div className="absolute inset-0 bg-primary/5 rounded-sm blur-xl group-focus-within:bg-primary/10 transition-all duration-500" />
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all duration-300" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Query modules, analytics, or People data..." 
              className="w-full pl-16 pr-8 py-6 rounded-sm bg-card/60 backdrop-blur-xl border border-border shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-card transition-all font-bold text-lg text-foreground placeholder:text-muted-foreground placeholder:font-medium"
            />
          </div>
        </div>

        <div className="space-y-20 reveal-2">
          <Launchpad userRole={userRole} searchQuery={searchQuery} />
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 reveal-3">
        <div className="border border-border px-6 py-2.5 rounded-md shadow-md bg-card/60 backdrop-blur-xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-foreground flex items-center gap-x-2">
            Edu Maysan Core <span className="h-1 w-1 rounded-full bg-primary" /> Architecture 2.5.0
          </p>
        </div>
      </footer>
    </div>

  );
}

