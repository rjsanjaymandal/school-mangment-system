"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
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
  Award,
  ShieldAlert,
  Heart,
  Shield,
  ShieldCheck,
  Stethoscope,
  Trophy,
  Globe,
  Plus
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
    group: "Main Dashboard",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, description: "Overview of school activities and key metrics" },
      { name: "Analytics", href: "/analytics", icon: Zap, futuristic: true, roles: ["admin", "teacher"], description: "Insights into school performance and trends" },
      { name: "Admin Insights", href: "/oracle", icon: BrainCircuit, futuristic: true, roles: ["admin"], description: "Advanced statistics for school management" },
    ],
  },
  {
    group: "People",
    roles: ["admin", "teacher"],
    items: [
      { name: "Students", href: "/students", icon: GraduationCap, description: "Manage student profiles and enrollment records" },
      { name: "Teachers", href: "/teachers", icon: UserSquare2, roles: ["admin"], description: "Manage teacher profiles and assignments" },
      { name: "Attendance", href: "/attendance", icon: ClipboardCheck, description: "Track daily attendance for students and staff" },
      { name: "Conduct", href: "/conduct", icon: ShieldAlert, description: "Monitor student behavior and disciplinary actions" },
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
      { name: "Fees & Payments", href: "/fees", icon: CreditCard, description: "Manage fee collection and payment records" },
      { name: "Library", href: "/library", icon: Library, description: "Manage books, issues, and returns" },
      { name: "Inventory", href: "/inventory", icon: Package, roles: ["admin"], description: "Track school stock and equipment" },
      { name: "Transport", href: "/transport", icon: Bus, description: "Manage school bus routes and transport detail" },
      { name: "Messages", href: "/messages", icon: MessageSquare, description: "Send announcements and internal messages" },
      { name: "Parents", href: "/guardian", icon: Heart, roles: ["admin", "teacher"], description: "Communicate with parents and guardians" },
    ],
  },
  {
    group: "Settings",
    roles: ["admin"],
    items: [
      { name: "Users", href: "/users", icon: ShieldCheck, roles: ["admin"], description: "Manage user accounts and system permissions" },
      { name: "System Settings", href: "/settings", icon: Settings, description: "Configure school details and system options" },
      { name: "Activity Logs", href: "/audit", icon: Shield, description: "View system activity and security logs" },
      { name: "Compliance", href: "/compliance", icon: FileText, description: "Manage school policies and legal documents" },
      { name: "Global Gateways", href: "/gateways", icon: Globe, description: "Configure external payment and notification providers" },
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
          (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           item.description?.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((group) => group.items.length > 0);

  if (filteredNavigation.length === 0 && searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="bg-slate-100 dark:bg-slate-900 p-6 rounded-full">
          <LayoutDashboard className="h-10 w-10 text-slate-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No modules found</h3>
          <p className="text-slate-500">Try searching for a different keyword or module name.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {filteredNavigation.map((group) => (
        <div key={group.group} className="space-y-8">
          <div className="flex items-center gap-x-6">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 whitespace-nowrap">
              {group.group}
            </h3>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col p-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/40 dark:border-slate-800/40 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:bg-white dark:hover:bg-slate-900 hover:-translate-y-2 transition-all duration-500 overflow-hidden"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-colors" />

                <div className="flex flex-col gap-y-6 relative z-10">
                  <div className={cn(
                    "w-14 h-14 flex items-center justify-center rounded-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-xl",
                    item.futuristic 
                      ? "bg-slate-900 text-blue-400 neon-blue" 
                      : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white group-hover:bg-slate-900 group-hover:text-white"
                  )}>
                    <item.icon className="h-7 w-7" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-x-2">
                      <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.name}
                      </span>
                      {item.futuristic && (
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed opacity-80 group-hover:opacity-100 transition-opacity line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between pointer-events-none relative z-10">
                  <div className="flex items-center gap-x-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Access System
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                    <Plus className="h-5 w-5 rotate-45 group-hover:rotate-90 transition-transform duration-500" />
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
