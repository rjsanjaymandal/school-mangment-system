"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  FileText,
  Settings,
  MessageSquare,
  Bus,
  Library,
  Package,
  Calendar,
  Award,
  ShieldCheck,
  Heart,
  Stethoscope,
  Trophy,
  Globe,
  BarChart3,
  FileBarChart,
  UserCheck,
  History,
  IndianRupee,
  BookMarked,
  ArrowRight,
  Sparkles,
  Search
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
  description?: string;
  isNew?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
  roles?: string[];
}

const navigation: NavGroup[] = [
  {
    group: "Dashboard",
    items: [
      { name: "Main Dashboard", href: "/", icon: LayoutDashboard, description: "Institutional overview and stats" },
      { name: "Teacher Dashboard", href: "/teacher/dashboard", icon: Users, roles: ["teacher"], description: "Manage your classes and students" },
    ],
  },
  {
    group: "Students",
    items: [
      { name: "Student List", href: "/students", icon: GraduationCap, description: "View and manage student profiles" },
      { name: "Enroll Student", href: "/students/enroll", icon: UserSquare2, description: "Register new students" },
      { name: "Attendance", href: "/students/attendance", icon: ClipboardCheck, description: "Track student daily attendance" },
      { name: "Documents", href: "/students/documents", icon: FileText, description: "Manage student certificates and files" },
      { name: "Behavior", href: "/conduct", icon: ShieldCheck, description: "Track student conduct and discipline" },
      { name: "Health", href: "/health", icon: Stethoscope, description: "Student health records and medical logs", isNew: true },
    ],
  },
  {
    group: "Staff & HR",
    roles: ["admin", "teacher"],
    items: [
      { name: "Staff List", href: "/hr/directory", icon: UserSquare2, roles: ["admin"], description: "Directory of all school staff" },
      { name: "Add Staff", href: "/hr/add-staff", icon: UserSquare2, roles: ["admin"], description: "Register new staff members" },
      { name: "Roles", href: "/hr/roles", icon: ShieldCheck, roles: ["admin"], description: "Manage user roles and permissions" },
      { name: "Staff Attendance", href: "/hr/attendance", icon: ClipboardCheck, roles: ["admin"], description: "Track staff attendance" },
      { name: "ID Cards", href: "/hr/download-center", icon: Package, roles: ["admin"], description: "Generate ID cards and certificates" },
    ],
  },
  {
    group: "Academics",
    items: [
      { name: "Classes", href: "/classes", icon: Users, roles: ["admin", "teacher"], description: "Manage class sections and levels" },
      { name: "Subjects", href: "/subjects", icon: BookOpen, roles: ["admin", "teacher"], description: "Manage school curriculum" },
      { name: "Exams", href: "/exams", icon: FileText, roles: ["admin", "teacher"], description: "Manage exam schedules and results" },
      { name: "Online Exams", href: "/exams/online", icon: Globe, roles: ["admin", "teacher"], description: "Online examination portal" },
      { name: "Gradebook", href: "/gradebook", icon: ClipboardCheck, description: "Student marks and progress reports" },
      { name: "Timetable", href: "/timetable", icon: Calendar, description: "School schedule and time management" },
      { name: "Certificates", href: "/certificates", icon: Award, description: "Generate student certificates" },
    ],
  },
  {
    group: "Finance",
    items: [
      { name: "Finance Dashboard", href: "/finance/dashboard", icon: IndianRupee, description: "Financial reports and overview" },
      { name: "Collect Fees", href: "/finance/collect", icon: IndianRupee, description: "Process student fee payments" },
      { name: "Fee Structure", href: "/finance/structure", icon: Settings, description: "Define school fee types" },
      { name: "Print Slips", href: "/finance/slips", icon: FileText, description: "Generate and print fee receipts" },
      { name: "Daily Report", href: "/finance/daily", icon: BarChart3, description: "Daily fee collection summary" },
      { name: "Day Book", href: "/finance/day-book", icon: BookMarked, roles: ["admin"], description: "Daily financial records" },
      { name: "Payroll", href: "/finance/process-salary", icon: IndianRupee, roles: ["admin"], description: "Manage and process staff salaries" },
    ],
  },
  {
    group: "Operations",
    items: [
      { name: "Library", href: "/library", icon: Library, description: "Track books and student issues" },
      { name: "Transport", href: "/transport", icon: Bus, description: "Manage bus routes and fleets" },
      { name: "Messages", href: "/messages", icon: MessageSquare, description: "Send school announcements" },
      { name: "Inventory", href: "/inventory", icon: Package, roles: ["admin"], description: "Manage school assets and stock" },
    ],
  },
  {
    group: "Reports",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3, description: "View school performance charts" },
      { name: "System Reports", href: "/reports", icon: FileBarChart, roles: ["admin"], description: "Download school data reports" },
    ],
  },
  {
    group: "System Settings",
    roles: ["admin"],
    items: [
      { name: "Notifications", href: "/notifications", icon: MessageSquare, description: "Manage system notifications" },
      { name: "User Accounts", href: "/users", icon: UserCheck, description: "Manage system user accounts" },
      { name: "General Settings", href: "/settings", icon: Settings, description: "General school configuration" },
      { name: "Enterprise", href: "/settings/enterprise", icon: Trophy, description: "Manage enterprise features" },
      { name: "Audit Logs", href: "/audit", icon: History, description: "Track system activity and changes" },
    ],
  },
];

export function Launchpad({ 
  userRole = "admin", 
  searchQuery = "" 
}: { 
  userRole?: string, 
  searchQuery?: string 
}) {
  const filteredNavigation = navigation
    .filter((group) => !group.roles || group.roles.includes(userRole))
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => 
          (!item.roles || item.roles.includes(userRole)) &&
          ((item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
           (item.description?.toLowerCase() || "").includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((group) => group.items.length > 0);

  if (filteredNavigation.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in duration-500">
        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-900/50 rounded-3xl border border-slate-200 dark:border-slate-800 mb-8 flex items-center justify-center shadow-sm">
          <Search className="h-8 w-8 text-slate-300" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">No Results Found</h3>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-sm font-medium">We couldn't find anything matching your search. Please try different keywords.</p>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {filteredNavigation.map((group, groupIdx) => (
        <div 
          key={group.group} 
          className="space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 fill-mode-both"
          style={{ animationDelay: `${groupIdx * 150}ms` }}
        >
          <div className="flex items-center gap-6">
            <div className="flex flex-col">
                <h3 className="text-[10px] font-black tracking-[0.25em] text-slate-400 dark:text-slate-500 uppercase leading-none mb-2">
                    Category
                </h3>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                    {group.group}
                </h2>
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {group.items.map((item, itemIdx) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col p-6 bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-[2rem] hover:border-emerald-500/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/5 overflow-hidden"
              >
                {/* Background Sparkle Effect */}
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-20 transition-opacity">
                    <Sparkles className="h-20 w-20 text-emerald-500 -mr-10 -mt-10 rotate-12" />
                </div>

                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 group-hover:ring-emerald-500">
                        <item.icon className="h-7 w-7 stroke-[1.5]" />
                    </div>
                    {item.isNew && (
                        <Badge className="bg-emerald-500 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-none shadow-lg shadow-emerald-500/20 animate-bounce">
                            New
                        </Badge>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <h3 className="font-black text-slate-900 dark:text-white text-base tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {item.name}
                        </h3>
                        <ArrowRight className="h-3 w-3 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-bold tracking-tight opacity-80 group-hover:opacity-100 transition-opacity">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {/* Decorative Bottom Bar */}
                <div className="absolute bottom-0 left-0 h-1 w-0 bg-emerald-500 group-hover:w-full transition-all duration-700 delay-100" />
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}