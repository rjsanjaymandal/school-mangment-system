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
import { ScrollArea } from "@/components/ui/scroll-area";

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
        href: "/students/list",
        icon: GraduationCap,
        subItems: [
          { name: "Student List", href: "/students/list" },
          { name: "Enroll", href: "/students/enroll" },
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
        name: "Staff",
        href: "/hr/directory",
        icon: UserSquare2,
        subItems: [
          { name: "Staff List", href: "/hr/directory" },
          { name: "Add Staff", href: "/hr/add-staff" },
          { name: "Permissions", href: "/hr/roles" },
          { name: "Attendance", href: "/hr/attendance" },
        ]
      },
      { name: "Faculty Desk", href: "/teacher/dashboard", icon: Users, roles: ["teacher"] },
    ],
  },
  {
    group: "Academics",
    roles: ["admin", "teacher", "student"],
    items: [
      { name: "Classes", href: "/classes", icon: Users, roles: ["admin", "teacher"] },
      { name: "Subjects", href: "/subjects", icon: BookOpen, roles: ["admin", "teacher"] },
      { name: "Exams", href: "/exams", icon: FileText, roles: ["admin", "teacher"] },
      { name: "Digital Exams", href: "/exams/online", icon: FileText, roles: ["admin", "teacher"] },
      { name: "Gradebook", href: "/gradebook", icon: ClipboardCheck },
      { name: "Timetable", href: "/timetable", icon: Calendar },
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Certificates", href: "/certificates", icon: Award },
    ],
  },
  {
    group: "Finance",
    items: [
      {
        name: "Fees",
        href: "/finance/collect-fees",
        icon: IndianRupee,
        subItems: [
          { name: "Collect Fees", href: "/finance/collect-fees" },
          { name: "Fee Setup", href: "/finance/structure" },
          { name: "Daily Log", href: "/finance/daily" },
          { name: "Receipts", href: "/finance/slips" },
        ]
      },
      {
        name: "Payroll",
        href: "/finance/process-salary",
        icon: Wallet,
        roles: ["admin"],
        subItems: [
          { name: "Pay Salary", href: "/finance/process-salary" },
          { name: "Day Book", href: "/finance/day-book" },
          { name: "Settings", href: "/finance/salary-settings" },
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
      { name: "Inbox", href: "/notifications", icon: Bell },
      { name: "Users", href: "/users", icon: UserCheck },
      { name: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ initialProfile, userRole }: { initialProfile: any; userRole: string | null }) {
  const pathname = usePathname();
  const { isCollapsed, toggle: toggleSidebar, width, setWidth } = useSidebarStore();
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
  const [profile, setProfile] = useState(initialProfile);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    if (isResizing) {
      const handleMouseMove = (e: MouseEvent) => {
        let newWidth = e.clientX;
        if (newWidth < 200) newWidth = 200;
        if (newWidth > 450) newWidth = 450;
        setWidth(newWidth);
      };

      const handleMouseUp = () => {
        setIsResizing(false);
        document.body.style.cursor = "default";
        document.body.style.userSelect = "auto";
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isResizing, setWidth]);

  useEffect(() => {
    // Determine which groups should be expanded based on current path
    const groupsToExpand = navigation
      .filter((group) => 
        group.items.some((item) => 
          pathname.startsWith(item.href) || 
          item.subItems?.some(sub => pathname.startsWith(sub.href))
        )
      )
      .map(g => g.group);
    
    setExpandedGroups(prev => [...new Set([...prev, ...groupsToExpand])]);
  }, [pathname]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => 
      prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
    );
  };

  const isItemActive = (item: NavItem) => {
    if (item.href === "/" && pathname !== "/") return false;
    return pathname.startsWith(item.href);
  };

  const canSeeItem = (item: NavItem) => {
    if (!item.roles) return true;
    return userRole && item.roles.includes(userRole);
  };

  const canSeeGroup = (group: NavGroup) => {
    if (!group.roles) return true;
    return userRole && group.roles.includes(userRole);
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-full bg-slate-950 border-r border-slate-800 transition-all duration-300 relative group/sidebar",
        isCollapsed ? "w-20" : "w-64"
      )}
      style={{ width: isCollapsed ? 80 : width }}
    >
      {/* Resize Handle */}
      {!isCollapsed && (
        <div 
          onMouseDown={() => setIsResizing(true)}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-emerald-500/50 transition-colors z-[60]"
        />
      )}
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="h-10 w-10 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
          <Shield className="h-6 w-6 text-white" />
        </div>
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-500">
            <h1 className="text-xl font-black text-white tracking-tighter">Edu Maysan</h1>
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 bg-slate-800 text-slate-400 p-1 rounded-full border border-slate-700 hover:text-white transition-colors z-50 cursor-pointer"
      >
        {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>

      {/* Navigation Links */}
      <ScrollArea className="flex-1 px-4 py-6" hideScrollbar>
        <div className="space-y-8">
          {navigation.filter(canSeeGroup).map((group) => (
            <div key={group.group} className="space-y-2">
              {!isCollapsed && (
                <h2 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 animate-in fade-in duration-700">
                  {group.group}
                </h2>
              )}
              
              <div className="space-y-1">
                {group.items.filter(canSeeItem).map((item) => {
                  const active = isItemActive(item);
                  const hasSubItems = item.subItems && item.subItems.length > 0;
                  const isExpanded = expandedGroups.includes(item.name);

                  return (
                    <div key={item.name} className="space-y-1">
                      {isCollapsed ? (
                        <TooltipProvider delayDuration={0}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Link 
                                href={item.href}
                                className={cn(
                                  "flex items-center justify-center h-12 w-12 mx-auto rounded-xl transition-all duration-200",
                                  active 
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                    : "text-slate-500 hover:text-slate-200 hover:bg-slate-900"
                                )}
                              >
                                <item.icon className="h-5 w-5" />
                              </Link>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-white font-bold text-xs px-3 py-1.5">
                              {item.name}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <>
                          {hasSubItems ? (
                            <button
                              onClick={() => toggleGroup(item.name)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                active ? "text-white" : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/50"
                              )}
                            >
                              <item.icon className={cn("h-5 w-5 transition-colors", active ? "text-emerald-400" : "group-hover:text-slate-200")} />
                              <span className="text-sm font-bold flex-1 text-left">{item.name}</span>
                              <ChevronDown className={cn("h-4 w-4 transition-transform duration-200 opacity-50", isExpanded && "rotate-180")} />
                            </button>
                          ) : (
                            <Link 
                              href={item.href}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                active ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:text-slate-200 hover:bg-slate-900/50"
                              )}
                            >
                              <item.icon className={cn("h-5 w-5 transition-colors", active ? "text-white" : "group-hover:text-slate-200")} />
                              <span className="text-sm font-bold">{item.name}</span>
                              {active && <div className="absolute right-3 h-1.5 w-1.5 rounded-full bg-white animate-pulse" />}
                            </Link>
                          )}

                          {/* Sub Items */}
                          {!isCollapsed && hasSubItems && isExpanded && (
                            <div className="ml-9 mt-1 space-y-1 animate-in slide-in-from-top-2 duration-300">
                              {item.subItems?.map((sub) => {
                                const subActive = pathname === sub.href;
                                return (
                                  <Link
                                    key={sub.name}
                                    href={sub.href}
                                    className={cn(
                                      "block px-3 py-2 text-xs font-bold transition-all rounded-lg relative",
                                      subActive 
                                        ? "text-emerald-400" 
                                        : "text-slate-600 hover:text-slate-400"
                                    )}
                                  >
                                    {subActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-3 bg-emerald-500 rounded-full" />}
                                    {sub.name}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* User Profile Mini */}
      {!isCollapsed && (
        <div className="p-4 mt-auto border-t border-slate-900 bg-slate-950/50 backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-white text-xs shadow-lg shadow-emerald-500/10">
              {profile?.full_name?.[0] || userRole?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-black text-white truncate">{profile?.full_name || "School User"}</p>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{userRole?.replace('_', ' ') || "Administrator"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
