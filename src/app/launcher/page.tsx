"use client";

// Force refresh
import { Suspense, lazy } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Search, LogOut, User as UserIcon, GraduationCap, Sparkles, Activity, ShieldCheck, IndianRupee, BookOpen, ClipboardCheck, Calendar, MessageSquare, Users, Library, Bus, Award, Heart, Clock, BookMarked, Monitor, Wallet, Star } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Lazy load Launchpad for faster initial render
const Launchpad = lazy(() => import("@/components/shared/Launchpad").then(m => ({ default: m.Launchpad })));

const roles = [
  { id: "admin", title: "Admin", icon: ShieldCheck, color: "from-blue-600 to-blue-700", bg: "bg-blue-50", text: "text-blue-600", desc: "Full institutional control & analytics" },
  { id: "teacher", title: "Educator", icon: BookOpen, color: "from-emerald-600 to-teal-600", bg: "bg-emerald-50", text: "text-emerald-600", desc: "Academic management & progress tracking" },
  { id: "student", title: "Student", icon: GraduationCap, color: "from-indigo-600 to-purple-600", bg: "bg-indigo-50", text: "text-indigo-600", desc: "Learning resources & personal data" },
  { id: "parent", title: "Guardian", icon: Users, color: "from-rose-600 to-pink-600", bg: "bg-rose-50", text: "text-rose-600", desc: "Monitor attendance & fee schedules" },
  { id: "accountant", title: "Accounts", icon: Wallet, color: "from-amber-600 to-orange-600", bg: "bg-amber-50", text: "text-amber-600", desc: "Financial records & fee collection" },
  { id: "receptionist", title: "Front Office", icon: Monitor, color: "from-slate-600 to-slate-700", bg: "bg-slate-50", text: "text-slate-600", desc: "Inquiries & visitor registration" },
];

const features = [
  { icon: ClipboardCheck, title: "Attendance Tracking", desc: "Real-time roll calls, telemetry, and daily presence logs" },
  { icon: BookOpen, title: "Grade Management", desc: "Term marks, progress cards, and comprehensive gradebooks" },
  { icon: Calendar, title: "Timetable Scheduling", desc: "Class periods, exam schedules, and resource allocation" },
  { icon: IndianRupee, title: "Fee Management", desc: "Collection, payment gateways, slips, and daily ledgers" },
  { icon: MessageSquare, title: "Communications", desc: "Announcements, messaging, and institutional alerts" },
  { icon: Users, title: "Student Records", desc: "Enrollment, guardians, documents, and conduct tracking" },
  { icon: Library, title: "Library Management", desc: "Catalog, book issues, returns, and digital resources" },
  { icon: Bus, title: "Transport Tracking", desc: "Bus routes, fleet management, and driver coordination" },
];

const quickStats = [
  { title: "Students Enrolled", value: "2,847", icon: GraduationCap, color: "emerald", accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { title: "Staff Members", value: "186", icon: Users, color: "blue", accent: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { title: "Classes Running", value: "94", icon: BookMarked, color: "amber", accent: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { title: "Years of Excellence", value: "25+", icon: Award, color: "purple", accent: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
];

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
  }, [router]);

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-full max-w-6xl px-4 space-y-10">
          <div className="flex flex-col items-center space-y-4">
            <SkeletonLoader className="h-8 w-48 rounded-full" />
            <SkeletonLoader className="h-16 w-96" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <SkeletonLoader key={i} className="h-40 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const userRole = userProfile?.role || "student";

  const handleRoleSwitch = (roleId: string) => {
    router.push(`/login?role=${roleId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden font-sans">
      {/* Animated gradient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] right-[-5%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-[-15%] left-[-5%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: "12s" }} />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-indigo-500/8 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: "15s" }} />
        <div className="absolute top-[-5%] left-[20%] w-[25%] h-[25%] bg-emerald-400/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "10s" }} />
        <div className="absolute bottom-[10%] right-[20%] w-[20%] h-[20%] bg-blue-400/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: "18s" }} />
      </div>

      {/* Subtle grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03]">
        <div className="h-full w-full" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "80px 80px" }} />
      </div>

      {/* Top Navigation */}
      <header className={cn(
        "relative z-50 flex items-center justify-between px-6 lg:px-12 py-5",
        "animate-in fade-in slide-in-from-top-4 duration-700"
      )}>
        <div className="flex items-center gap-x-5">
          <div className="h-12 rounded-xl overflow-hidden shadow-xl shadow-emerald-500/20">
            <Image 
              src="/logo-rounded-v2.png" 
              alt="Edu Maysan" 
              width={160}
              height={48}
              className="object-contain h-full w-auto brightness-0 invert"
              style={{ width: 'auto', height: '100%' }}
              priority
            />
          </div>
          <div className="h-7 w-px bg-white/10" />
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40">School Management</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-3 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-xl border border-white/10">
            <Clock className="h-4 w-4 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white leading-none">
                {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
              <span className="text-[10px] text-white/40 font-medium leading-none">
                {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          <div className="h-6 w-px bg-white/10 hidden xl:block" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-white/5 transition-colors group">
                <div className="relative">
                  {userProfile?.avatar_url ? (
                    <Avatar className="h-10 w-10 rounded-xl ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all">
                      <AvatarImage src={userProfile.avatar_url} alt={userProfile?.full_name || "User"} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-sm">
                        {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm ring-2 ring-emerald-500/20 group-hover:ring-emerald-500/40 transition-all shadow-lg">
                      {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-emerald-500 rounded-full border-2 border-slate-900" />
                </div>
                <div className="hidden xl:block text-left">
                  <p className="text-sm font-bold text-white leading-tight">
                    {userProfile?.full_name || "User"}
                  </p>
                  <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 capitalize text-white/60 border-white/10 font-bold mt-0.5 bg-white/5">{userRole}</Badge>
                </div>
              </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-64 mt-2 rounded-2xl p-2 border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-2xl shadow-black/50" align="end" sideOffset={8}>
              <DropdownMenuLabel className="p-3 bg-white/5 rounded-xl mb-2">
                <div className="flex items-center gap-3">
                  {userProfile?.avatar_url ? (
                    <Avatar className="h-10 w-10 rounded-xl">
                      <AvatarImage src={userProfile.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold">
                        {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold">
                      {userProfile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-white">
                      {userProfile?.full_name || "User"}
                    </p>
                    <p className="text-xs text-white/50 truncate font-medium">{userProfile?.email || userProfile?.user_email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              
              <DropdownMenuItem className="rounded-xl p-2.5 cursor-pointer hover:bg-white/5 text-white/80 hover:text-white transition-all" onClick={() => router.push("/profile")}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
                    <UserIcon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-semibold">My Profile</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuItem className="rounded-xl p-2.5 cursor-pointer hover:bg-white/5 text-white/80 hover:text-white transition-all" onClick={() => router.push("/settings")}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-white/10 text-white/60">
                    <Activity className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-semibold">Settings</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-white/10" />
              
              <DropdownMenuItem className="rounded-xl p-2.5 cursor-pointer hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 transition-all" onClick={handleSignOut}>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                    <LogOut className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-semibold">Sign Out</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 pt-4 pb-36">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-12 gap-10 mb-20 items-end">
          <div className="lg:col-span-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-2.5">
              <Badge className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-bold text-[10px] uppercase tracking-wider backdrop-blur-xl">
                <Sparkles className="h-3 w-3 mr-1.5" /> Enterprise Suite v4.8
              </Badge>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.05]">
              {getGreeting()}, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-200">
                {userProfile?.full_name?.split(' ')[0] || userProfile?.first_name || "User"}
              </span>
            </h1>
            <p className="text-lg text-white/50 font-medium max-w-2xl leading-relaxed">
              Welcome to your institutional command center. Access every module, manage resources, and drive academic excellence from one unified dashboard.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              {roles.map((role, idx) => {
                const Icon = role.icon;
                const isActive = userRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSwitch(role.id)}
                    className={cn(
                      "group relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300",
                      "border backdrop-blur-xl",
                      "animate-in fade-in slide-in-from-bottom-4 fill-mode-both",
                      isActive
                        ? "bg-white/10 border-white/20 text-white shadow-lg shadow-white/5"
                        : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.08] hover:border-white/20"
                    )}
                    style={{ animationDelay: `${300 + idx * 80}ms` }}
                  >
                    <Icon className={cn("h-3.5 w-3.5", isActive ? "text-emerald-400" : "text-white/30 group-hover:text-emerald-400 transition-colors")} />
                    {role.title}
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse ml-0.5" />}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full max-w-xl group pt-4">
              <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-500" />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30 group-focus-within:text-emerald-400 transition-colors z-10" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules, features, or records..." 
                className="relative w-full pl-14 pr-5 py-4 rounded-2xl bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all font-medium text-sm text-white placeholder:text-white/30 z-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors z-10"
                >
                  <span className="text-xs font-bold uppercase tracking-wider">Clear</span>
                </button>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-6 rounded-2xl shadow-xl">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-5 flex items-center gap-2">
                <Activity className="h-3.5 w-3.5 text-emerald-400" /> System Status
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white/80">Students</span>
                      <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Portal Status</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-400">Online</span>
                  </div>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white/80">Security</span>
                      <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Protection Layer</p>
                    </div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border-emerald-500/30 px-2.5 py-0.5">Active</Badge>
                </div>
                <div className="h-px bg-white/5" />
                <div className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <IndianRupee className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white/80">Fees</span>
                      <p className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Payment Systems</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">Up to date</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Section */}
        <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.25em] text-white/30 uppercase leading-none mb-2">Overview</span>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none">Institutional Metrics</h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {quickStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="group bg-white/[0.04] backdrop-blur-2xl border border-white/10 shadow-xl hover:bg-white/[0.06] hover:border-white/20 p-5 rounded-2xl flex items-center justify-between hover:scale-[1.02] transition-all duration-300 cursor-default hover:shadow-2xl animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  style={{ animationDelay: `${400 + idx * 100}ms` }}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest mt-1 text-emerald-400">
                      ↑ {idx === 0 ? "+12% this year" : idx === 1 ? "+8 new this year" : idx === 2 ? "Across 6 grades" : "Since 2001"}
                    </p>
                  </div>
                  <div className={cn("p-3.5 rounded-xl border-2 transition-all group-hover:rotate-6 group-hover:shadow-lg", stat.accent)}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <div className="flex items-center gap-6 mb-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-[0.25em] text-white/30 uppercase leading-none mb-2">Capabilities</span>
              <h2 className="text-2xl font-black text-white tracking-tight leading-none">Core Features</h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={cn(
                    "group relative p-6 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/10",
                    "hover:bg-white/[0.06] hover:border-emerald-500/30 hover:-translate-y-1",
                    "transition-all duration-500 cursor-default overflow-hidden",
                    "animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
                  )}
                  style={{ animationDelay: `${600 + idx * 80}ms` }}
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                    <Star className="h-16 w-16 text-emerald-400 -mr-8 -mt-8 rotate-12" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-emerald-500/5 group-hover:shadow-emerald-500/20">
                      <Icon className="h-6 w-6 stroke-[1.5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">{feature.title}</h3>
                      <p className="text-xs text-white/40 font-medium mt-1.5 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-emerald-500 group-hover:w-full transition-all duration-700" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Launchpad Modules Grid */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-700">
          <Suspense fallback={
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonLoader key={i} className="h-40 rounded-[2rem]" />
              ))}
            </div>
          }>
            <Launchpad userRole={userRole} searchQuery={searchQuery} />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-50 animate-in fade-in duration-1000 delay-1000">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-8">
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-2xl px-8 py-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-8 rounded-lg overflow-hidden">
                  <Image 
                    src="/logo-rounded-v2.png" 
                    alt="Edu Maysan" 
                    width={100}
                    height={32}
                    className="object-contain h-full w-auto brightness-0 invert opacity-60"
                    style={{ width: 'auto', height: '100%' }}
                  />
                </div>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">
                  School Management System
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.15em] text-white/20">
                  <Heart className="h-3 w-3 text-emerald-400/50" />
                  <span>Built with care</span>
                </div>
                <span className="text-white/10">|</span>
                <span className="text-[9px] font-bold text-white/20 tracking-[0.15em]">&copy; {currentTime.getFullYear()} Edu Maysan</span>
                <span className="text-white/10">|</span>
                <span className="text-[9px] font-bold text-white/20 tracking-[0.15em]">v4.8</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
