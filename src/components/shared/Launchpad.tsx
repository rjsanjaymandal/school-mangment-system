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
  CreditCard,
  Settings,
  MessageSquare,
  Bus,
  Library,
  Package,
  Calendar,
  Award,
  ShieldCheck,
  Heart,
  Shield,
  Stethoscope,
  Trophy,
  Globe,
  Plus,
  ChevronRight,
  BarChart3,
  FileBarChart,
  UserCheck,
  History,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  futuristic?: boolean;
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
    group: "Overview",
    items: [
      { name: "Analytics", href: "/analytics", icon: BarChart3, roles: ["admin", "teacher"], description: "Analyze school performance and institutional trends" },
      { name: "Reports", href: "/reports", icon: FileBarChart, roles: ["admin"], description: "Generate comprehensive academic and operational reports" },
    ],
  },
  {
    group: "Personnel",
    roles: ["admin", "teacher", "student"],
    items: [
      { name: "Students", href: "/students", icon: GraduationCap, description: "Manage student profiles and enrollment records" },
      { name: "Staff", href: "/teachers", icon: UserSquare2, roles: ["admin"], description: "Manage institutional personnel and payroll" },
      { name: "Attendance", href: "/attendance", icon: ClipboardCheck, description: "Track daily attendance for students and staff" },
      { name: "Conduct", href: "/conduct", icon: ShieldCheck, description: "Monitor student behavior and disciplinary actions" },
      { name: "Health", href: "/health", icon: Stethoscope, description: "Track student health records and medical info" },
      { name: "Alumni", href: "/heritage", icon: GraduationCap, roles: ["admin"], description: "Manage records for former students" },
    ],
  },
  {
    group: "Academics",
    roles: ["admin", "teacher", "student"],
    items: [
      { name: "Classes", href: "/classes", icon: Users, roles: ["admin", "teacher"], description: "Manage class sections and student groups" },
      { name: "Subjects", href: "/subjects", icon: BookOpen, roles: ["admin", "teacher"], description: "Manage curriculum and course materials" },
      { name: "Grades", href: "/gradebook", icon: FileText, description: "Track student marks and academic performance" },
      { name: "Exams", href: "/exams", icon: ClipboardCheck, description: "Manage exam schedules and result processing" },
      { name: "Timetable", href: "/timetable", icon: Calendar, description: "Manage school schedules and class timings" },
      { name: "Certificates", href: "/certificates", icon: Award, description: "Generate and issue student certificates" },
      { name: "Activities", href: "/activities", icon: Trophy, roles: ["admin", "teacher"], description: "Manage extracurricular events and activities" },
    ],
  },
  {
    group: "Operations",
    items: [
      { name: "Fees", href: "/fees", icon: CreditCard, description: "Manage fee collection and payment records" },
      { name: "Library", href: "/library", icon: Library, description: "Manage books, issues, and returns" },
      { name: "Inventory", href: "/inventory", icon: Package, roles: ["admin"], description: "Manage school inventory and assets" },
      { name: "Transport", href: "/transport", icon: Bus, description: "Manage school bus routes and transport detail" },
      { name: "Messages", href: "/messages", icon: MessageSquare, description: "Send announcements and internal messages" },
      { name: "Guardians", href: "/guardian", icon: Heart, roles: ["admin", "teacher"], description: "Communicate with parents and guardians" },
    ],
  },
  {
    group: "System",
    roles: ["admin"],
    items: [
      { name: "Users", href: "/users", icon: UserCheck, roles: ["admin"], description: "Manage user accounts and system permissions" },
      { name: "Settings", href: "/settings", icon: Settings, description: "Configure school details and system options" },
      { name: "Logs", href: "/audit", icon: History, description: "View system activity and historical audit logs" },
      { name: "Compliance", href: "/compliance", icon: ShieldCheck, description: "Manage school policies and institutional compliance" },
      { name: "Infrastructure", href: "/gateways", icon: Globe, description: "Configure external services and system gateways" },
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
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-slate-100 dark:bg-card p-6 rounded-sm border border-border">
          <LayoutDashboard className="h-10 w-10 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-foreground dark:text-white">No modules found</h3>
          <p className="text-muted-foreground">Try searching for a different keyword or module name.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-12 page-fade-in">
      {filteredNavigation.map((group) => (
        <div key={group.group} className="space-y-6">
          <div className="flex items-center gap-x-6 px-1">
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
              {group.group}
            </h3>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl transition-all duration-300 soft-shadow hover:soft-shadow-lg hover:border-blue-500/30 overflow-hidden"
              >
                <div className="flex flex-col gap-y-6 relative z-10">
                  <div className="w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-300 bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 shadow-sm">
                    <item.icon className="h-7 w-7" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between pointer-events-none relative z-10">
                  <div className="flex items-center gap-x-2 text-[11px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                    Go to Module <ChevronRight className="h-3.5 w-3.5" />
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

