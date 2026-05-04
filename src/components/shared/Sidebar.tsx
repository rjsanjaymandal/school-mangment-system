"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
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
  Package,
  Calendar,
  IndianRupee,
  Truck,
  Award,
  ShieldCheck,
  Heart,
  Shield,
  Stethoscope,
  Trophy,
  Globe,
  BarChart3,
  FileBarChart,
  UserCheck,
  History,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserService } from "@/lib/services/user";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
}

interface NavGroup {
  group: string;
  items: NavItem[];
  roles?: string[];
}

const navigation: NavGroup[] = [
  {
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      {
        name: "Analytics",
        href: "/analytics",
        icon: BarChart3,
        roles: ["admin", "teacher"],
      },
      {
        name: "Reports",
        href: "/reports",
        icon: FileBarChart,
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
      { name: "Conduct", href: "/conduct", icon: UserCheck },
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
        icon: UserCheck,
        roles: ["admin"],
      },
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Logs", href: "/audit", icon: History },
      { name: "Compliance", href: "/compliance", icon: ShieldCheck },
      { name: "Gateways", href: "/gateways", icon: Globe },
    ],
  },
];

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
    <div className="flex h-full flex-col bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-300">
      <div className="p-8 pb-4 flex items-center gap-x-3">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2 rounded-lg">
            <GraduationCap className="h-5 w-5" />
          </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-tight">
            Edu Maysan
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-8 space-y-10 scrollbar-hide">
        {filteredNavigation.map((group) => (
          <div key={group.group} className="space-y-4">
            <div className="flex items-center gap-x-3 px-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                {group.group}
              </h3>
              <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800/50" />
            </div>
            <div className="space-y-1.5">
              {group.items.map((item) => (
                 <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-x-3 text-slate-500 dark:text-slate-400 text-[13px] font-bold uppercase tracking-wide px-4 py-2.5 rounded-xl transition-all duration-200",
                    pathname === item.href 
                      ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                      : "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                   <div
                    className={cn(
                      "p-1.5 rounded-lg transition-all duration-200",
                      pathname === item.href
                        ? "text-inherit"
                        : "bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:text-inherit",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                  </div>
                  <span className="relative z-10">{item.name}</span>
                  
                   {pathname === item.href && (
                    <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-blue-500" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

       <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
        <Link href="/profile" className="relative group cursor-pointer block overflow-hidden p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm">
            <div className="flex items-center gap-x-4 relative z-10">
            <div className="h-10 w-10 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-lg shadow-sm transition-transform duration-300 group-hover:scale-105">
              {userProfile?.full_name?.[0] || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold tracking-tight truncate text-slate-900 dark:text-white">
                {userProfile
                  ? userProfile.full_name
                  : "Syncing..."}
              </span>
              <div className="flex items-center gap-x-2">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                    {userRole}
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
