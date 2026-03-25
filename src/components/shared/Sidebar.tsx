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
    <div className="flex h-full flex-col bg-card/80 backdrop-blur-xl border-r border-border text-foreground transition-all duration-300">
      <div className="p-6 pb-2 flex items-center gap-x-3 reveal-0">
        <div className="bg-primary text-primary-foreground p-2 rounded-sm shadow-xl emerald-glow transition-all duration-500 hover:rotate-3">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tight text-foreground">
            Edu Maysan
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 -mt-1">
            Core System
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8 space-y-9 scrollbar-hide reveal-1">
        {filteredNavigation.map((group) => (
          <div key={group.group} className="space-y-3">
            <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.4em] text-primary/80 whitespace-nowrap">
              {group.group}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-x-3 text-foreground/80 text-sm font-bold px-3 py-2.5 rounded-sm transition-all duration-300",
                    pathname === item.href 
                      ? "bg-primary/20 text-primary shadow-[inset_0_0_0_1px_oklch(var(--primary)/0.3)]" 
                      : "hover:bg-accent hover:text-foreground",
                    item.futuristic && "relative overflow-hidden"
                  )}
                >
                  <div
                    className={cn(
                      "p-1.5 rounded-xs transition-all duration-300",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground shadow-lg emerald-glow"
                        : "bg-accent text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110", pathname === item.href && "scale-110")} />
                  </div>
                  <span className="tracking-tight">{item.name}</span>
                  {item.futuristic && (
                    <span className="ml-auto flex h-1.5 w-1.5 rounded-sm bg-primary animate-pulse shadow-sm shadow-primary/50" />
                  )}
                  {pathname === item.href && (
                    <div className="absolute left-0 w-1 h-6 bg-primary rounded-r-sm shadow-[2px_0_10px_oklch(var(--primary)/0.4)]" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border bg-card/60 backdrop-blur-md reveal-3">
        <div className="flex items-center gap-x-3 p-3 rounded-sm bg-accent/50 border border-border group cursor-pointer hover:bg-accent transition-all duration-300">
          <div className="h-10 w-10 rounded-xs bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shadow-lg emerald-glow">
            {userProfile?.first_name?.[0] || "U"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-black tracking-tight truncate text-foreground">
              {userProfile
                ? `${userProfile.first_name} ${userProfile.last_name}`
                : "Loading Profile..."}
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary truncate">
              {userRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

