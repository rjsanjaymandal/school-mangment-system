"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  roles?: string[];
  description?: string;
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
      { name: "Home", href: "/", icon: LayoutDashboard, description: "Main dashboard" },
    ],
  },
  {
    group: "Students",
    items: [
      { name: "Students", href: "/students", icon: GraduationCap, description: "Manage student profiles" },
      { name: "Attendance", href: "/attendance", icon: ClipboardCheck, description: "Track daily attendance" },
      { name: "Conduct", href: "/conduct", icon: ShieldCheck, description: "Student behavior records" },
      { name: "Health", href: "/health", icon: Stethoscope, description: "Health profiles & medical" },
    ],
  },
  {
    group: "Staff",
    items: [
      { name: "Teachers", href: "/teachers", icon: UserSquare2, roles: ["admin"], description: "Staff directory" },
      { name: "HR", href: "/hr", icon: Users, roles: ["admin"], description: "Human resources" },
    ],
  },
  {
    group: "Academics",
    items: [
      { name: "Classes", href: "/classes", icon: Users, roles: ["admin", "teacher"], description: "Class sections" },
      { name: "Subjects", href: "/subjects", icon: BookOpen, roles: ["admin", "teacher"], description: "Curriculum" },
      { name: "Exams", href: "/exams", icon: FileText, description: "Exam schedules" },
      { name: "Gradebook", href: "/gradebook", icon: ClipboardCheck, description: "Student marks" },
      { name: "Timetable", href: "/timetable", icon: Calendar, description: "School schedule" },
      { name: "Certificates", href: "/certificates", icon: Award, description: "Generate certificates" },
    ],
  },
  {
    group: "Finance",
    items: [
      { name: "Fee Collection", href: "/finance/dashboard", icon: IndianRupee, description: "Manage fees & payments" },
    ],
  },
  {
    group: "Operations",
    items: [
      { name: "Library", href: "/library", icon: Library, description: "Books & issues" },
      { name: "Transport", href: "/transport", icon: Bus, description: "Bus routes" },
      { name: "Messages", href: "/messages", icon: MessageSquare, description: "Announcements" },
    ],
  },
  {
    group: "Reports",
    roles: ["admin", "teacher"],
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3, description: "Performance analytics" },
      { name: "Reports", href: "/reports", icon: FileBarChart, roles: ["admin"], description: "Generate reports" },
    ],
  },
  {
    group: "System",
    roles: ["admin"],
    items: [
      { name: "Users", href: "/users", icon: UserCheck, description: "User accounts" },
      { name: "Settings", href: "/settings", icon: Settings, description: "School configuration" },
      { name: "Audit Logs", href: "/audit", icon: History, description: "System activity" },
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
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-300">
        <div className="bg-slate-100 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 shadow-sm">
          <LayoutDashboard className="h-12 w-12 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No modules found</h3>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-sm">We couldn't find any modules matching "{searchQuery}". Try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-12">
      {filteredNavigation.map((group) => (
        <div key={group.group} className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-700 fill-mode-both" style={{ animationDelay: `${filteredNavigation.indexOf(group) * 100}ms` }}>
          <div className="flex items-center gap-4">
            <h3 className="text-sm font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase bg-white dark:bg-slate-900 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              {group.group}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-col p-5 bg-white dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/80 rounded-2xl hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(16,185,129,0.05)] hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 dark:to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 group-hover:scale-110 shadow-sm ring-1 ring-slate-100 dark:ring-slate-800 group-hover:ring-emerald-500">
                    <item.icon className="h-6 w-6 stroke-[1.5]" />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-medium">
                      {item.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}