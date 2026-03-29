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
    group: "Overview",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, description: "Overview of school activities and key metrics" },
      { name: "Analytics", href: "/analytics", icon: Zap, roles: ["admin", "teacher"], description: "Insights into school performance and trends" },
      { name: "Reports", href: "/oracle", icon: BrainCircuit, roles: ["admin"], description: "Advanced statistics for school management" },
    ],
  },
  {
    group: "Personnel",
    roles: ["admin", "teacher", "student"],
    items: [
      { name: "Students", href: "/students", icon: GraduationCap, description: "Manage student profiles and enrollment records" },
      { name: "Staff", href: "/teachers", icon: UserSquare2, roles: ["admin"], description: "Manage institutional personnel and payroll" },
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
      { name: "Users", href: "/users", icon: ShieldCheck, roles: ["admin"], description: "Manage user accounts and system permissions" },
      { name: "Settings", href: "/settings", icon: Settings, description: "Configure school details and system options" },
      { name: "Logs", href: "/audit", icon: Shield, description: "View system activity and security logs" },
      { name: "Compliance", href: "/compliance", icon: FileText, description: "Manage school policies and legal documents" },
      { name: "Gateways", href: "/gateways", icon: Globe, description: "Configure external payment and notification providers" },
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
    <div className="space-y-16 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      {filteredNavigation.map((group) => (
        <div key={group.group} className="space-y-8">
          <div className="flex items-center gap-x-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary whitespace-nowrap">
              {group.group}
            </h3>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex flex-col p-8 bg-card border border-border rounded-lg shadow-sm hover:border-primary transition-all duration-200"
              >
                 <div className="flex flex-col gap-y-6 relative z-10">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg transition-all duration-200 bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <item.icon className="h-6 w-6" />
                  </div>
                                    <div className="space-y-2">
                    <div className="flex items-center gap-x-2">
                      <span className="font-semibold text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-[12px] text-muted-foreground font-medium leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                  <div className="mt-8 flex items-center justify-between pointer-events-none relative z-10">
                  <div className="flex items-center gap-x-1.5 text-[10px] font-semibold text-muted-foreground group-hover:text-primary transition-colors">
                    Open Module
                  </div>
                  <div className="h-8 w-8 rounded-md bg-secondary border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-200">
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
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

