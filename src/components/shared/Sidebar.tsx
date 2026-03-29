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
  IndianRupee,
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
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      {
        name: "Analytics",
        href: "/analytics",
        icon: Zap,
        roles: ["admin", "teacher"],
      },
      {
        name: "Reports",
        href: "/oracle",
        icon: BrainCircuit,
        roles: ["admin"],
      },
    ],
  },
  {
    group: "Personnel",
    roles: ["admin", "teacher", "student"],
    items: [
      { name: "Students", href: "/students", icon: GraduationCap },
      { name: "Staff", href: "/teachers", icon: UserSquare2, roles: ["admin"] },
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
      { name: "Fees", href: "/fees", icon: CreditCard },
      { name: "Library", href: "/library", icon: Library },
      {
        name: "Inventory",
        href: "/inventory",
        icon: Package,
        roles: ["admin"],
      },
      { name: "Transport", href: "/transport", icon: Bus },
      { name: "Messages", href: "/messages", icon: MessageSquare },
      {
        name: "Guardians",
        href: "/guardian",
        icon: Heart,
        roles: ["admin", "teacher"],
      },
    ],
  },
  {
    group: "System",
    roles: ["admin"],
    items: [
      {
        name: "Users",
        href: "/users",
        icon: ShieldCheck,
        roles: ["admin"],
      },
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Logs", href: "/audit", icon: Shield },
      { name: "Compliance", href: "/compliance", icon: FileText },
      { name: "Gateways", href: "/gateways", icon: Globe },
    ],
  },
];

import { useEffect, useState } from "react";
import { UserService } from "@/lib/services/user";

export function Sidebar({ initialProfile }: { initialProfile?: any }) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<any>(initialProfile || null);

  useEffect(() => {
    if (initialProfile) return;

    let active = true;

    const fetchProfile = async () => {
      const profile = await UserService.getCurrentProfile();
      if (active && profile && !("error" in profile)) {
        setUserProfile(profile);
      }
    };

    void fetchProfile();

    return () => {
      active = false;
    };
  }, [initialProfile]);

  const resolvedProfile = initialProfile ?? userProfile;
  const userRole = resolvedProfile?.role || "student";

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
    <div className="flex h-full flex-col bg-background border-r border-border text-foreground transition-all duration-300">
      <div className="p-8 pb-4 flex items-center gap-x-4 reveal-0">
          <div className="relative bg-primary text-primary-foreground p-2 rounded-lg shadow-sm transition-all duration-300 group-hover/logo:scale-105">
            <GraduationCap className="h-6 w-6" />
          </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-foreground leading-none">
            Maysan
          </span>
          <span className="text-[10px] font-medium text-muted-foreground mt-1">
            Management System
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-8 space-y-10 scrollbar-hide reveal-1">
        {filteredNavigation.map((group) => (
          <div key={group.group} className="space-y-4">
            <div className="flex items-center gap-x-3 px-4">
              <h3 className="text-[10px] font-semibold text-muted-foreground/60 whitespace-nowrap">
                {group.group}
              </h3>
              <div className="h-[1px] w-full bg-border" />
            </div>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                 <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-x-3 text-muted-foreground text-[13px] font-medium px-4 py-2.5 rounded-lg transition-all duration-200",
                    pathname === item.href 
                      ? "bg-primary/10 text-primary" 
                      : "hover:bg-secondary/60 hover:text-foreground"
                  )}
                >
                   <div
                    className={cn(
                      "p-1.5 rounded-md transition-all duration-200",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-secondary text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="relative z-10 transition-colors duration-500">{item.name}</span>
                  
                   {/* Status indicators removed */}

                   {pathname === item.href && (
                    <div className="absolute left-0 w-1 h-3/5 bg-primary rounded-r-full" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

       <div className="p-6 border-t border-border bg-card/20">
        <div className="relative group cursor-pointer overflow-hidden p-4 rounded-xl bg-secondary/20 border border-border transition-all duration-300 hover:bg-secondary/40">
          <div className="absolute top-0 right-0 p-1 opacity-20 transition-opacity group-hover:opacity-100">
             <Zap className="h-3 w-3 text-primary" />
          </div>
            <div className="flex items-center gap-x-4 relative z-10">
            <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm transition-transform duration-300 group-hover:scale-105">
              {userProfile?.full_name?.[0] || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold tracking-tight truncate text-foreground">
                {userProfile
                  ? userProfile.full_name
                  : "Syncing..."}
              </span>
              <div className="flex items-center gap-x-2">
                <span className="h-1 w-1 rounded-full bg-primary" />
                <span className="text-[10px] font-medium text-muted-foreground truncate">
                    {userRole} Account
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

