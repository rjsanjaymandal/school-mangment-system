"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BrainCircuit,
  Users,
  UserSquare2,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  FileText,
  CreditCard,
  Settings,
  MessageSquare,
  Bus,
  Library,
  Zap,
  Package,
  Calendar,
  DollarSign,
  Truck,
  Award,
  ShieldAlert,
  Heart,
  Shield,
  ShieldCheck,
  Stethoscope,
  Trophy,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  futuristic?: boolean;
  roles?: string[]; // Allowed roles for this item
}

interface NavGroup {
  group: string;
  items: NavItem[];
  roles?: string[]; // Allowed roles for the entire group
}

const navigation: NavGroup[] = [
  {
    group: "Main Dashboard",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      {
        name: "Analytics",
        href: "/analytics",
        icon: Zap,
        futuristic: true,
        roles: ["admin", "teacher"],
      },
      {
        name: "Admin Insights",
        href: "/oracle",
        icon: BrainCircuit,
        futuristic: true,
        roles: ["admin"],
      },
    ],
  },
  {
    group: "People",
    roles: ["admin", "teacher", "student"],
    items: [
      { name: "Students", href: "/students", icon: GraduationCap },
      { name: "Staff HR", href: "/teachers", icon: UserSquare2, roles: ["admin"] },
      { name: "Attendance", href: "/attendance", icon: ClipboardCheck, roles: ["admin", "teacher", "student"] },
      { name: "Conduct", href: "/conduct", icon: ShieldAlert },
      { name: "Health", href: "/health", icon: Stethoscope },
      {
        name: "Alumni",
        href: "/heritage",
        icon: GraduationCap,
        roles: ["admin"],
      },
    ],
  },
  {
    group: "Academics",
    roles: ["admin", "teacher", "student"],
    items: [
      {
        name: "Classes",
        href: "/classes",
        icon: Users,
        roles: ["admin", "teacher"],
      },
      {
        name: "Subjects",
        href: "/subjects",
        icon: BookOpen,
        roles: ["admin", "teacher"],
      },
      { name: "Grades", href: "/gradebook", icon: FileText },
      { name: "Exams", href: "/exams", icon: ClipboardCheck },
      { name: "Timetable", href: "/timetable", icon: Calendar },
      { name: "Certificates", href: "/certificates", icon: Award },
      {
        name: "Activities",
        href: "/activities",
        icon: Trophy,
        roles: ["admin", "teacher"],
      },
    ],
  },
  {
    group: "Operations",
    items: [
      { name: "Fees & Payments", href: "/fees", icon: CreditCard },
      { name: "Library", href: "/library", icon: Library },
      {
        name: "Logistics",
        href: "/inventory",
        icon: Package,
        roles: ["admin"],
      },
      { name: "Transport", href: "/transport", icon: Bus },
      { name: "Messages", href: "/messages", icon: MessageSquare },
      {
        name: "Parents",
        href: "/guardian",
        icon: Heart,
        roles: ["admin", "teacher"],
      },
    ],
  },
  {
    group: "Settings",
    roles: ["admin"],
    items: [
      {
        name: "Users",
        href: "/users",
        icon: ShieldCheck,
        roles: ["admin"],
      },
      { name: "System Settings", href: "/settings", icon: Settings },
      { name: "Activity Logs", href: "/audit", icon: Shield },
      { name: "Compliance", href: "/compliance", icon: FileText },
      { name: "Global Gateways", href: "/gateways", icon: Globe },
    ],
  },
];

import { useEffect, useState } from "react";
import { UserService } from "@/lib/services/user";

export function Sidebar({ initialProfile }: { initialProfile?: any }) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<any>(initialProfile || null);

  useEffect(() => {
    if (initialProfile) {
      setUserProfile(initialProfile);
      return;
    }

    const fetchProfile = async () => {
      const profile = await UserService.getCurrentProfile();
      if (profile && !("error" in profile)) {
        setUserProfile(profile);
      }
    };
    fetchProfile();
  }, [initialProfile]);

  const userRole = userProfile?.role || "student";

  const filteredNavigation = navigation
    .filter((group) => !group.roles || group.roles.includes(userRole))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(userRole),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="flex h-full flex-col bg-background/60 backdrop-blur-3xl border-r border-white/5 text-foreground transition-all duration-500">
      <div className="p-8 pb-4 flex items-center gap-x-4 reveal-0">
        <div className="relative group/logo">
          <div className="absolute -inset-2 bg-primary/20 rounded-sm blur-lg group-hover/logo:bg-primary/30 transition-all duration-500" />
          <div className="relative bg-primary text-primary-foreground p-2.5 rounded-sm shadow-2xl emerald-border-glow transition-all duration-500 group-hover/logo:scale-110 group-hover/logo:rotate-3">
            <GraduationCap className="h-7 w-7" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="font-black text-2xl tracking-tighter text-foreground uppercase italic leading-none">
            Maysan
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/80 mt-1">
            Institutional OS
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-8 space-y-10 scrollbar-hide reveal-1">
        {filteredNavigation.map((group) => (
          <div key={group.group} className="space-y-4">
            <div className="flex items-center gap-x-3 px-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary/60 whitespace-nowrap">
                {group.group}
              </h3>
              <div className="h-[1px] w-full bg-primary/10" />
            </div>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-x-3 text-foreground/60 text-[11px] font-black uppercase tracking-widest px-4 py-3 rounded-sm transition-all duration-500",
                    pathname === item.href 
                      ? "bg-primary/10 text-primary emerald-border-glow" 
                      : "hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <div
                    className={cn(
                      "p-2 rounded-xs transition-all duration-500",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground shadow-2xl scale-110"
                        : "bg-white/5 text-foreground/40 group-hover:bg-primary/20 group-hover:text-primary group-hover:scale-110",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="relative z-10 transition-colors duration-500">{item.name}</span>
                  
                  {item.futuristic && (
                    <div className="ml-auto flex items-center gap-x-2">
                       <span className="h-1 w-1 rounded-full bg-primary animate-ping" />
                       <span className="text-[8px] font-black text-primary animate-pulse">LIVE</span>
                    </div>
                  )}

                  {pathname === item.href && (
                    <>
                      <div className="absolute left-0 w-1 h-3/5 bg-primary rounded-r-full shadow-[4px_0_15px_oklch(var(--primary)/0.6)]" />
                      <div className="absolute inset-0 bg-primary/5 rounded-sm animate-pulse" />
                    </>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-white/5 bg-background/40 backdrop-blur-2xl reveal-3">
        <div className="relative group cursor-pointer overflow-hidden p-4 rounded-sm bg-white/5 border border-white/5 transition-all duration-500 hover:bg-white/10 hover:border-primary/30">
          <div className="absolute top-0 right-0 p-1 opacity-20 transition-opacity group-hover:opacity-100">
             <Zap className="h-3 w-3 text-primary" />
          </div>
          <div className="flex items-center gap-x-4 relative z-10">
            <div className="h-11 w-11 rounded-sm bg-primary text-primary-foreground flex items-center justify-center font-black text-xl shadow-2xl emerald-border-glow transition-transform duration-500 group-hover:scale-105">
              {userProfile?.first_name?.[0] || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-black tracking-tight truncate text-foreground uppercase italic">
                {userProfile
                  ? `${userProfile.first_name} ${userProfile.last_name}`
                  : "Syncing..."}
              </span>
              <div className="flex items-center gap-x-2">
                <span className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary/80 truncate">
                  {userRole} Node
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

