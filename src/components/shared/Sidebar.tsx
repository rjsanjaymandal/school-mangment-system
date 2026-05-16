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
  Settings,
  Bus,
  Library,
  Calendar,
  IndianRupee,
  Award,
  Stethoscope,
  BarChart3,
  FileBarChart,
  UserCheck,
  History,
  ChevronDown,
  Shield,
  Wallet,
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserService } from "@/lib/services/user";
import { createClient } from "@/lib/supabase/client";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
    group: "Main",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    group: "Students",
    roles: ["admin", "teacher", "student"],
    items: [
      {
        name: "Students",
        href: "/students",
        icon: GraduationCap,
        subItems: [
          { name: "All Students", href: "/students/list" },
          { name: "Enroll New", href: "/students/enroll" },
          { name: "Attendance", href: "/students/attendance" },
          { name: "Documents", href: "/students/documents" },
        ]
      },
      { name: "Conduct", href: "/conduct", icon: UserCheck },
      { name: "Health", href: "/health", icon: Stethoscope },
    ],
  },
  {
    group: "Staff",
    roles: ["admin", "teacher"],
    items: [
      {
        name: "HR & Staff",
        href: "/hr/directory",
        icon: UserSquare2,
        subItems: [
          { name: "Staff Directory", href: "/hr/directory" },
          { name: "Add Staff", href: "/hr/add-staff" },
          { name: "Role & Permissions", href: "/hr/roles" },
          { name: "Staff Attendance", href: "/hr/attendance" },
        ]
      },
      { name: "Teacher Dashboard", href: "/teacher/dashboard", icon: Users, roles: ["teacher"] },
    ],
  },
  {
    group: "Academics",
    roles: ["admin", "teacher", "student"],
    items: [
      { name: "Classes", href: "/classes", icon: Users, roles: ["admin", "teacher"] },
      { name: "Subjects", href: "/subjects", icon: BookOpen, roles: ["admin", "teacher"] },
      { name: "Exams", href: "/exams", icon: FileText, roles: ["admin", "teacher"] },
      { name: "Online Exams", href: "/exams/online", icon: FileText, roles: ["admin", "teacher"] },
      { name: "Gradebook", href: "/gradebook", icon: ClipboardCheck },
      { name: "Timetable", href: "/timetable", icon: Calendar },
      { name: "Report Cards", href: "/reports", icon: BarChart3 },
      { name: "Certificates", href: "/certificates", icon: Award },
    ],
  },
  {
    group: "Finance",
    items: [
      {
        name: "Fee Collection",
        href: "/finance/collect-fees",
        icon: IndianRupee,
        subItems: [
          { name: "Collect Fees", href: "/finance/collect-fees" },
          { name: "Fee Structure", href: "/finance/structure" },
          { name: "Daily Report", href: "/finance/daily" },
          { name: "Print Slip", href: "/finance/slips" },
        ]
      },
      {
        name: "Accounts & Payroll",
        href: "/finance/process-salary",
        icon: Wallet,
        roles: ["admin"],
        subItems: [
          { name: "Process Salary", href: "/finance/process-salary" },
          { name: "Day Book", href: "/finance/day-book" },
          { name: "Salary Settings", href: "/finance/salary-settings" },
        ]
      },
    ],
  },
  {
    group: "Resources",
    items: [
      { name: "Library", href: "/library", icon: Library },
      { name: "Transport", href: "/transport", icon: Bus },
    ],
  },
  {
    group: "System",
    roles: ["admin"],
    items: [
      { name: "Audit Logs", href: "/audit", icon: History },
      { name: "Notifications", href: "/notifications", icon: Bell },
      { name: "Users", href: "/users", icon: UserCheck },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ initialProfile, userRole }: { initialProfile?: any; userRole?: string }) {
  const pathname = usePathname();
  const [userProfile, setUserProfile] = useState<any>(initialProfile || null);
  const [expandedItems, setExpandedItems] = useState<string[]>(["Students"]);
  const { isCollapsed, toggle } = useSidebarStore();
  const currentRole = userRole || userProfile?.role || "student";

  const toggleExpand = (name: string) => {
    if (isCollapsed) {
        toggle(); // Expand if collapsed when clicking a group
    }
    setExpandedItems(prev => 
      prev.includes(name) ? prev.filter(i => i !== name) : [...prev, name]
    );
  };

  useEffect(() => {
    if (initialProfile) return;
    let active = true;
    const fetchProfile = async () => {
      const supabase = createClient();
      const profile = await UserService.getCurrentProfile(supabase);
      if (active && profile && !("error" in profile)) {
        setUserProfile(profile);
      }
    };
    void fetchProfile();
    return () => { active = false; };
  }, [initialProfile]);

  const resolvedProfile = initialProfile ?? userProfile;
  const roleToUse = currentRole || resolvedProfile?.role || "student";

  const filteredNavigation = navigation
    .filter((group) => !group.roles || group.roles.includes(roleToUse))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(roleToUse),
      ),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <TooltipProvider delayDuration={0}>
    <div className={cn(
        "flex h-full flex-col bg-white border-r border-slate-200 text-slate-900 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
    )}>
      <div className={cn(
        "p-4 flex items-center border-b border-slate-100 h-16",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        {!isCollapsed && (
          <Link href="/" className="flex items-center group">
            <span className="text-xl font-black tracking-tight text-slate-900 uppercase whitespace-nowrap">
              Edu <span className="text-emerald-600">Maysan</span>
            </span>
          </Link>
        )}
        <button 
          onClick={toggle}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6 scrollbar-hide" style={{ overflowX: 'hidden' }}>
        {filteredNavigation.map((group) => (
          <div key={group.group}>
            {!isCollapsed && (
              <h3 className="text-[10px] font-bold text-slate-400 uppercase mb-3 px-3 tracking-widest">
                {group.group}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isExpanded = expandedItems.includes(item.name);
                const hasSubItems = item.subItems && item.subItems.length > 0;
                const isActive = pathname === item.href || (hasSubItems && item.subItems?.some(s => pathname === s.href));

                const content = (
                  <div key={item.name} className="space-y-1">
                    {hasSubItems ? (
                      <button
                        onClick={() => toggleExpand(item.name)}
                        className={cn(
                          "w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                          isActive && !hasSubItems
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                          isCollapsed && "justify-center px-0"
                        )}
                      >
                        <div className={cn("flex items-center gap-3", isCollapsed && "gap-0")}>
                          <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-emerald-500" : "text-slate-400")} />
                          {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                        </div>
                        {!isCollapsed && <ChevronDown className={cn("h-4 w-4 ml-auto transition-transform duration-200", isExpanded ? "rotate-180" : "")} />}
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        prefetch={true}
                        className={cn(
                          "w-full flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                          isActive
                            ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                          isCollapsed && "justify-center px-0"
                        )}
                      >
                        <div className={cn("flex items-center gap-3", isCollapsed && "gap-0")}>
                          <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-emerald-500" : "text-slate-400")} />
                          {!isCollapsed && <span className="whitespace-nowrap">{item.name}</span>}
                        </div>
                      </Link>
                    )}

                    {hasSubItems && isExpanded && !isCollapsed && (
                      <div className="ml-4 pl-4 border-l-2 border-slate-100 space-y-1 mt-1 animate-in slide-in-from-left-2 duration-200">
                        {item.subItems?.map(sub => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            prefetch={true}
                            className={cn(
                              "block px-3 py-2 text-xs rounded-lg transition-colors",
                              pathname === sub.href
                                ? "text-emerald-600 bg-emerald-50/50 font-semibold"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );

                if (isCollapsed) {
                    return (
                        <Tooltip key={item.name}>
                            <TooltipTrigger asChild>
                                {content}
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-slate-900 text-white border-none px-3 py-1.5 text-xs font-bold rounded-lg shadow-xl">
                                {item.name}
                            </TooltipContent>
                        </Tooltip>
                    );
                }

                return content;
              })}
            </div>
          </div>
        ))}
      </div>

      <div className={cn(
        "p-4 border-t border-slate-100 bg-slate-50/30",
        isCollapsed ? "flex justify-center" : ""
      )}>
        <Link href="/profile" className={cn(
            "flex items-center gap-3 p-2 rounded-xl transition-all hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100",
            isCollapsed ? "justify-center p-0 border-none" : ""
        )}>
            <div className="h-9 w-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0" suppressHydrationWarning>
              {(initialProfile?.full_name || userProfile?.full_name || 'U')[0]?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
                <div className="flex-1 min-w-0" suppressHydrationWarning>
                  <p className="text-sm font-bold truncate text-slate-900">{initialProfile?.full_name || userProfile?.full_name || "Loading..."}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{userRole}</p>
                </div>
            )}
          </Link>
      </div>
    </div>
    </TooltipProvider>
  );
}
