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
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserService } from "@/lib/services/user";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
  subItems?: { name: string; href: string }[];
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
      { 
        name: "Students", 
        href: "/students", 
        icon: GraduationCap,
        subItems: [
          { name: "Enroll New", href: "/students/enroll" },
          { name: "Student List", href: "/students/list" },
          { name: "Attendance", href: "/students/attendance" },
        ]
      },
      { name: "Staff", href: "/teachers", icon: UserSquare2, roles: ["admin"] },
      { name: "Conduct", href: "/conduct", icon: UserCheck },
      { name: "Health", href: "/health", icon: Stethoscope },
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
      { name: "Gradebook", href: "/gradebook", icon: FileText },
      { name: "Certificates", href: "/certificates", icon: Award },
    ],
  },
  {
    group: "Operations",
    items: [
      { name: "Fees", href: "/fees", icon: CreditCard },
      { name: "Library", href: "/library", icon: Library },
      { name: "Transport", href: "/transport", icon: Bus },
    ],
  },
  {
    group: "System",
    roles: ["admin"],
    items: [
      { name: "Users", href: "/users", icon: UserCheck },
      { name: "Settings", href: "/settings", icon: Settings },
      { name: "Logs", href: "/audit", icon: History },
    ],
  },
];

export function Sidebar({ initialProfile }: { initialProfile?: any }) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<any>(initialProfile || null);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Students"]);

  const toggleExpand = (name: string) => {
    setExpandedItems(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

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
    return () => { active = false; };
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
    <div className="flex h-full flex-col bg-white dark:bg-slate-950 border-r border-slate-200/60 dark:border-slate-800/60 text-slate-900 dark:text-slate-100 transition-all duration-300">
      <div className="p-8 pb-4 flex items-center gap-x-4">
          <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-2xl shadow-xl emerald-glow">
            <GraduationCap className="h-6 w-6" />
          </div>
        <div className="flex flex-col">
          <span className="font-black text-xl tracking-tighter uppercase italic">
            Edu Maysan
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mt-0.5">Institutional ERP</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-10 space-y-12 scrollbar-hide">
        {filteredNavigation.map((group) => (
          <div key={group.group} className="space-y-6">
            <div className="flex items-center gap-x-4 px-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                {group.group}
              </h3>
              <div className="h-[1px] w-full bg-slate-100 dark:bg-slate-800/50" />
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isExpanded = expandedItems.includes(item.name);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isActive = pathname === item.href || (hasSubItems && item.subItems?.some(s => pathname === s.href));

                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => hasSubItems && toggleExpand(item.name)}
                      className={cn(
                        "w-full group relative flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest px-4 py-3 rounded-2xl transition-all duration-300",
                        isActive && !hasSubItems
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-x-4">
                        <div className={cn(
                          "p-1.5 rounded-xl transition-all duration-300",
                          isActive
                            ? "bg-primary/10 text-primary shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 group-hover:text-inherit"
                        )}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <span>{item.name}</span>
                      </div>
                      {hasSubItems && (
                         <div className={cn("transition-transform duration-300", isExpanded ? "rotate-180" : "")}>
                           <ChevronDown className="h-3 w-3" />
                         </div>
                      )}
                    </button>

                    {hasSubItems && isExpanded && (
                      <div className="ml-6 pl-6 border-l border-slate-100 dark:border-slate-800 space-y-1 py-1">
                        {item.subItems?.map(sub => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={cn(
                              "block px-4 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                              pathname === sub.href
                                ? "text-primary bg-primary/5"
                                : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900"
                            )}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <Link href="/profile" className="relative group cursor-pointer block overflow-hidden p-4 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:border-primary/30 shadow-sm hover:shadow-xl hover:shadow-primary/5">
            <div className="flex items-center gap-x-4 relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-xl shadow-lg transition-transform duration-500 group-hover:scale-110 emerald-glow">
              {userProfile?.full_name?.[0] || "U"}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-black tracking-tighter truncate text-slate-900 dark:text-white uppercase italic">
                {userProfile ? userProfile.full_name : "Syncing..."}
              </span>
              <div className="flex items-center gap-x-2 mt-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] truncate">
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
